import asyncio
import datetime
import io
import json
from fastapi import FastAPI, Query, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import base64
from PIL import Image
import torch
from torchvision import transforms
from ultralytics import YOLO
import time

import config


@asynccontextmanager
async def lifespan(app: FastAPI):
    config.model = YOLO(config.settings.NAME_MODEL)
    print("cuda" if torch.cuda.is_available() else "cpu")
    config.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    with open("data.json", "r", encoding="utf-8") as file:
        config.data = json.loads(file.read())

    print("Запуск...")
    yield


app = FastAPI(lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=config.settings.CORS_URL,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


async def add_report(report):
    if len(report) > 0:
        config.col.insert_one({"report": report, "created_at": datetime.datetime.now()})


def proccess_items(items):
    res = []
    for item in items:
        item["_id"] = str(item["_id"])
        res.append(item)
    return res


@app.get("/logs")
async def get_logs(
    limit: int = Query(100, le=100, gt=0), skip: int | None = Query(None, gt=0)
):
    if skip is not None:
        res = config.col.find().limit(limit).skip(skip)
        return proccess_items(res)
    else:
        res = config.col.find().limit(limit)
        return proccess_items(res)


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_json()

            start_time = time.time()
            image_data = base64.b64decode(data["img"])
            orig_img = Image.open(io.BytesIO(image_data))
            orig_img = orig_img.resize((640, 640))

            image_tensor = transforms.ToTensor()(orig_img).unsqueeze(0)

            m: YOLO = config.model
            pred = m.predict(image_tensor, device=config.device)[0]

            report = {}
            for box in pred.boxes:
                label = config.model.names[int(box.cls)]
                if label in report:
                    report[label]["count"] += 1
                else:
                    report[label] = {"count": 1, "sign": config.data[label]}
            report = sorted(list(report.values()), key=lambda d: d["sign"]["name"])

            end_time = time.time()
            delta = str(end_time - start_time)

            asyncio.create_task(add_report(report))
            await websocket.send_json({"report": report, "time": delta})
    except WebSocketDisconnect as e:
        print(e)
    except Exception as e:
        print(e)

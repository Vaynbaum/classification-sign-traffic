Веб-приложение для распознавания дорожных знаков в реальном времени

для запуска необходимо ввести команду
> docker compose up

Для запуска в режиме разработки:
1. Backend запускается командами
> pip install -r requirements.txt
> 
> uvicorn main:app --reload

2. Frontend запускается командами
> npm i
> 
> npm run start

Средства разработки - `vs code`

Для просмотра документации (методов) backend'а - [Swagger](http://localhost:8000/docs)

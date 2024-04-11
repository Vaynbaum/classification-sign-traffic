import { Component, EventEmitter, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { WebSocketSubject, webSocket } from 'rxjs/webSocket';
import {
  WebcamImage,
  WebcamInitError,
  WebcamModule,
  WebcamUtil,
} from 'ngx-webcam';
import { Observable, Subject } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';
import { environment } from '../environments/environment';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {
  MatSlideToggleModule,
  _MatSlideToggleRequiredValidatorModule,
} from '@angular/material/slide-toggle';
import { FormsModule } from '@angular/forms';
const TIMEOUT = 5000;
const INTERVAL = 400;

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    WebcamModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    FormsModule,
  ],
  encapsulation: ViewEncapsulation.None,
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  showWebcam = false;
  allowCameraSwitch = true;
  multipleWebcamsAvailable = false;
  deviceId?: string;
  videoOptions: MediaTrackConstraints = {};
  errors: WebcamInitError[] = [];
  trigger: Subject<void> = new Subject<void>();
  nextWebcam: Subject<boolean | string> = new Subject<boolean | string>();

  // isChecked = false;
  // signBtns = new Map([
  //   [true, { icon: 'layers' }],
  //   [false, { icon: 'layers_clear' }],
  // ]);
  imgStyle = {};
  // signBtn = this.signBtns.get(this.isChecked);

  powerToggle = true;
  powerBtns = new Map([
    [
      true,
      {
        icon: 'photo_camera',
        action: () => {
          this.powerOn();
        },
      },
    ],
    [
      false,
      {
        icon: 'no_photography',
        action: () => {
          this.powerOff();
        },
      },
    ],
  ]);
  powerBtn = this.powerBtns.get(this.powerToggle);
  tracks: any;

  ws: WebSocketSubject<any> | undefined;
  imagePath: any = '';

  constructor(private _sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    this.traffic_signs = [];
    this.connectWS();

    // document.getElementById('powerBtn')?.click()

    setTimeout(
      () => {
        this.traffic_signs = [
          // {
          //   count: 1,
          //   sign: {
          //     name: 'Железнодорожный переезд без шлагбаума',
          //     img: '/assets/images/1_2.svg'
          //   }
          // },
          // {
          //   count: 1,
          //   sign: {
          //     name: 'Железнодорожный переезд без шлагбаума',
          //     img: '/assets/images/1_2.svg'
          //   }
          // },
          // {
          //   count: 1,
          //   sign: {
          //     name: 'Железнодорожный переезд без шлагбаума',
          //     img: '/assets/images/1_2.svg'
          //   }
          // },
          // {
          //   count: 1,
          //   sign: {
          //     name: 'Железнодорожный переезд без шлагбаума',
          //     img: '/assets/images/1_2.svg'
          //   }
          // },
          // {
          //   count: 1,
          //   sign: {
          //     name: 'Железнодорожный переезд без шлагбаума',
          //     img: '/assets/images/1_2.svg'
          //   }
          // },
          // {
          //   count: 1,
          //   sign: {
          //     name: 'Железнодорожный переезд без шлагбаума',
          //     img: '/assets/images/1_2.svg'
          //   }
          // },
          // {
          //   count: 1,
          //   sign: {
          //     name: 'Железнодорожный переезд без шлагбаума',
          //     img: '/assets/images/1_2.svg'
          //   }
          // },
        ];
      },
      1000
    )

    // setTimeout(
    //   () => {
    //     this.traffic_signs = []
    //   }, 10000
    // )

    WebcamUtil.getAvailableVideoInputs().then(
      (mediaDevices: MediaDeviceInfo[]) => {
        console.log(mediaDevices)
        this.multipleWebcamsAvailable = mediaDevices && mediaDevices.length > 1;
      }
    );

    WebcamUtil.getAvailableVideoInputs().then(
      (mediaDevices: MediaDeviceInfo[]) => {
        this.multipleWebcamsAvailable = mediaDevices && mediaDevices.length > 1;
      }
    );

    setInterval(() => {
      this.triggerSnapshot();
    }, INTERVAL);
  }

  toggleWebcam(): void {
    this.showWebcam = !this.showWebcam;
  }

  // schangeShowReport() {
  //   this.isChecked = !this.isChecked;
  //   this.signBtn = this.signBtns.get(this.isChecked);
  // }

  powerOn() {
    this.powerToggle = !this.powerToggle;
    this.powerBtn = this.powerBtns.get(this.powerToggle);
    this.showWebcam = true;
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      this.tracks = stream.getVideoTracks();
    });
  }

  powerOff() {
    this.powerToggle = !this.powerToggle;
    this.powerBtn = this.powerBtns.get(this.powerToggle);
    this.showWebcam = false;
    this.tracks.forEach((track: any) => {
      track.stop();
    });
    this.traffic_signs = [];
    this.imagePath = '';
  }

  triggerSnapshot() {
    this.trigger.next();
  }

  showNextWebcam(directionOrDeviceId: boolean | string): void {
    this.nextWebcam.next(directionOrDeviceId);
  }

  handleInitError(error: WebcamInitError): void {
    this.errors.push(error);
  }

  get triggerObservable(): Observable<void> {
    return this.trigger.asObservable();
  }

  get nextWebcamObservable(): Observable<boolean | string> {
    return this.nextWebcam.asObservable();
  }

  public cameraWasSwitched(deviceId: string): void {
    console.log('active device: ' + deviceId);
    this.deviceId = deviceId;
  }

  handleImage(webcamImage: WebcamImage): void {
    this.ws?.next({ img: webcamImage.imageAsBase64 });
    // this.imagePath = webcamImage.imageAsDataUrl;
  }

  traffic_signs: any;
  item_style = {};
  connectWS() {
    this.ws = webSocket(`${environment.URL}/ws`);
    this.ws.asObservable().subscribe(
      (dataFromServer: any) => {
        if (this.showWebcam) {
          // this.imagePath = this._sanitizer.bypassSecurityTrustResourceUrl(
          //   'data:image/jpg;base64,' + dataFromServer.img
          // );
          console.log(dataFromServer.time * 1000);

          let l = dataFromServer.report.length;
          let a = '40%';
          if (l > 4) a = '20%';
          if (l > 12) a = '10%';
          this.item_style = { 'flex-basis': a };
          this.traffic_signs = dataFromServer.report;

          this.imgStyle = { filter: 'brightness(60%)' };
        }
      },
      (error: any) => {
        console.error('Error:', error);
        setTimeout(() => {
          this.connectWS();
        }, TIMEOUT);
      }
    );
  }

  closeWS() {
    this.ws?.complete();
  }
}

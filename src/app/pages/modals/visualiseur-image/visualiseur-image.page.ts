import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { Benef_activ_pms, LocalFile, Local_benef_activ_bl, Loc_PR } from 'src/app/interfaces/interfaces-local';

@Component({
  selector: 'app-visualiseur-image',
  templateUrl: './visualiseur-image.page.html',
  styleUrls: ['./visualiseur-image.page.scss'],
})
export class VisualiseurImagePage implements OnInit {
  isImgCinPR: boolean = false;
  isImgCinBl: boolean = false;
  isImgCinPms: boolean = false;
  isViewImg1: boolean = false;
  isViewImg2: boolean = false;

  elem_pr: Loc_PR = <Loc_PR>{};
  elem_bl: Local_benef_activ_bl = <Local_benef_activ_bl>{};
  elem_pms: Benef_activ_pms = <Benef_activ_pms>{};
  // image
  fileImage_cin1: LocalFile = {
    name: null,
    date: null,
    data: null
  };
  fileImage_cin2: LocalFile = {
    name: null,
    date: null,
    data: null
  };
  fileImage: LocalFile = {
    name: null,
    date: null,
    data: null
  };

  constructor(
    private navParams: NavParams,
    private modalCtrl: ModalController
    ) {
      if (this.navParams.get("isImgCinPR") || this.navParams.get("isImgCinBL") || this.navParams.get("isImgCinPms")) {
        if (this.navParams.get("isImgCinPR") != undefined) {
          this.isImgCinPR = this.navParams.get("isImgCinPR");
          //
          if (this.navParams.get("elem_pr") != undefined) {
            this.elem_pr = this.navParams.get("elem_pr");
        
            if (this.elem_pr.img_cin != null) {
              let img_cin = this.elem_pr.img_cin;
              let parse_img_cin: string = JSON.parse(img_cin);
              let arr_img_cin = parse_img_cin.split('-');
              arr_img_cin.forEach((elem_img, ind_img) => {
                if (ind_img == 0) {
                  this.fileImage_cin1.data = elem_img;
                  this.isViewImg1 = true;
                } else if (ind_img == 1) {
                  this.fileImage_cin2.data = elem_img;
                }
              });
            }
          }
        } else if (this.navParams.get("isImgCinBL") != undefined) {
          this.isImgCinBl = this.navParams.get("isImgCinBL");

          if (this.navParams.get("elem_bl") != undefined) {
            this.elem_bl = this.navParams.get("elem_bl");
            console.log("Elem Bloc:::", this.elem_bl);
            if (this.elem_bl.img_cin != null) {
              let img_cin = this.elem_bl.img_cin;
              let parse_img_cin: string = JSON.parse(img_cin);
              let arr_img_cin = parse_img_cin.split('-');
              arr_img_cin.forEach((elem_img, ind_img) => {
                if (ind_img == 0) {
                  this.fileImage_cin1.data = elem_img;
                  this.isViewImg1 = true;
                } else if (ind_img == 1) {
                  this.fileImage_cin2.data = elem_img;
                }
              });
            }
          }
        } else if (this.navParams.get("isImgCinPms") != undefined) {
          this.isImgCinPms = this.navParams.get("isImgCinPms");

          if (this.navParams.get("elem_pms") != undefined) {
            this.elem_pms = this.navParams.get("elem_pms");
            console.log("Elem pms:::", this.elem_pms);
            if (this.elem_pms.img_cin != null) {
              let img_cin = this.elem_pms.img_cin;
              let parse_img_cin: string = JSON.parse(img_cin);
              let arr_img_cin = parse_img_cin.split('-');
              arr_img_cin.forEach((elem_img, ind_img) => {
                if (ind_img == 0) {
                  this.fileImage_cin1.data = elem_img;
                  this.isViewImg1 = true;
                } else if (ind_img == 1) {
                  this.fileImage_cin2.data = elem_img;
                }
              });
            }
          }
        }
      }
  }

  ngOnInit() {
  }

  onShowImg(src: string) {
    if (src === 'img-1') {
      this.isViewImg2 = false;
      this.isViewImg1 = true;
    } else if (src === 'img-2') {
      this.isViewImg2 = true;
      this.isViewImg1 = false;
    }
  }
  onClose() {
    this.modalCtrl.dismiss();
  }
}

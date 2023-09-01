import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { LoadingController, ModalController } from '@ionic/angular';
import { UpdateAnimationVe, UpdateAnimeSpecu } from 'src/app/interfaces/interface-insertDb';
import { LocalFile, Loc_activ_projet, Loc_AnimationSpecu, Loc_AnimationVe, Loc_categEspece, Loc_Commune, Loc_district, Loc_Espece, Loc_export_excel, Loc_Fokontany, Loc_PR, Loc_projet, Loc_region, Loc_variette } from 'src/app/interfaces/interfaces-local';
import { LoadDataService } from 'src/app/services/local/load-data.service';
import { ACTIVE, ANIMATION, SYNC, UPDATE, VE } from 'src/app/utils/global-variables';
import { Utilisateurs } from 'src/app/utils/interface-bd';
import { ModalPrPage } from '../../modals/modal-pr/modal-pr.page';

import * as _moment from 'moment';
import { CrudDbService } from 'src/app/services/local/crud-db.service';
import { ExportExcelService } from 'src/app/services/export-excel.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from 'src/app/component/dialog/dialog.component';
const moment = _moment;

interface AnimetionVe {
  pr: Loc_PR,
  dt_anime: string,
  nb_participant: number,
  nb_femme: number,
  nb_homme: number,
  nb_inf_25: number,
  speculation: any[],
  img_piece: LocalFile[],
  region: Loc_region,
  district: Loc_district,
  commune: Loc_Commune,
  fokontany: Loc_Fokontany,
  village: string,
  quantite_specu: number,
  specu_delete:  Loc_AnimationSpecu[],
  specu_add_edit: any[]
}

@Component({
  selector: 'app-animation-ve',
  templateUrl: './animation-ve.page.html',
  styleUrls: ['./animation-ve.page.scss'],
  animations: [ //utiliser pour @detailExpand (table expendable)
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ])
  ]
})
export class AnimationVePage implements OnInit {
  private projet: Loc_projet;
  private user: Utilisateurs[];
  private activite: Loc_activ_projet;

  private data_animation_ve: Loc_AnimationVe[] = [];
  private data_anime_specu: Loc_AnimationSpecu[] = [];
  private src_animation: Loc_AnimationVe[] = [];
  private src_ve: Loc_AnimationVe[] = [];

  // displayed columns
  displayedColumnsAnimeVe: string[] = ['code_pr', 'nom', 'code_anime', 'date_anime', 'commune', 'fokontany', 'nb_participant', 'nb_f', 'nb_h', 'nb-25', 'nb_specu', 'img_pièce', 'action'];
  displayedColumnsAddAnimeVe: string[] = ['new_code_pr', 'new_nom', 'new_code_anime', 'new_date_anime', 'new_commune', 'new_fokontany', 'new_nb_participant', 'new_nb_f', 'new_nb_h', 'new_nb-25', 'new_nb_specu', 'new_img_pièce', 'new_action'];
  displayedColumnsSpecu: string[] = ['speculation', 'quantite'];

  // data source Mep
  dataSourceAnimation = new MatTableDataSource<Loc_AnimationVe>();
  dataSourceVe = new MatTableDataSource<Loc_AnimationVe>();

  isTableAnimationExpanded = false;
  isUpdate: boolean = false;

  data_region: Loc_region[] = [];
  data_district: Loc_district[] = [];
  data_commune: Loc_Commune[] = [];
  data_fokontany: Loc_Fokontany[] = [];
  update_animeve: AnimetionVe = {
    pr: null,
    dt_anime: null,
    nb_participant: null,
    nb_femme: null,
    nb_homme: null,
    nb_inf_25: null,
    speculation: null,
    img_piece: null,
    region: null,
    district: null,
    commune: null,
    fokontany: null,
    village: null,
    quantite_specu: null,
    specu_delete: null,
    specu_add_edit: null
  };
  isAddAnimation: boolean = false;
  isRowEditAnimation: boolean = false;
  indexRowEdit: number;
  data_pr: Loc_PR[] = [];

  data_espece: Loc_Espece[] = [];
  data_var: Loc_variette[] = [];
  data_categ: Loc_categEspece[] = [];

  data_animation_export: any[] = [];
  data_ve_export: any[] =  [];
  data_anime_specu_export: any[] = [];
  data_ve_specu_export: any[] = [];

  etat_sync = SYNC;

  constructor(
    private router: Router,
    private loadData: LoadDataService,
    private modalCtrl: ModalController,
    private loadingCtrl: LoadingController,
    private crudData: CrudDbService, 
    private dataExport: ExportExcelService,
    private dialog: MatDialog
    ) {
      const routeState = this.router.getCurrentNavigation().extras.state;
      console.log("Route state::::", routeState);
        if (routeState) {
          let projet: Loc_projet;
    
          projet = JSON.parse(routeState.projet);
          this.user = JSON.parse(routeState.user);
          this.activite = routeState.activite;
          this.projet = projet;
          console.log(":::Projet:::", this.projet);
          console.log(":::USers::::", this.user);
          console.log(":::Activiter::::", this.activite);
          this.loadAnimation();
        }
    }

  ngOnInit() {
    this.loadZone();
    this.loadPRBloc();
    this.loadSpeculation();
  }

  async onFinish() {
    const loading = await this.loadingCtrl.create();
    await loading.present();
    this.isUpdate = false;
    if (this.isRowEditAnimation) {
      this.isRowEditAnimation = false;
      this.indexRowEdit = null;
    }
    if (this.isAddAnimation) {
      this.isAddAnimation = false;
    }
    setTimeout(async () => {
      this.loadAnimation();
      this.loadingCtrl.dismiss();
    }, 700);
  }
  // Export
  onExport(data: any) {
    if (data === 'animation') {
      console.log("::::Export Animation:::");
      let export_anime: Loc_export_excel[] = [
        {
          data: this.data_animation_export,
          name_feuille:  'animation',
          name_file: 'PR_Animation_'  + this.projet.ancronyme + '-' + this.user[this.user.length - 1].id_equipe + this.user[this.user.length - 1].nom + '_' +this.user[this.user.length - 1].prenom
        },
        {
          data: this.data_anime_specu_export,
          name_feuille:  'Speculation Anime',
          name_file: 'PR_Animation_'  + this.projet.ancronyme + '-' + this.user[this.user.length - 1].id_equipe + this.user[this.user.length - 1].nom + '_' +this.user[this.user.length - 1].prenom
        }
      ];
      this.dataExport.onExport(export_anime);
    } else if (data === 've') {
      console.log("::::Export Ve:::");
      let export_ve: Loc_export_excel[] = [
        {
          data: this.data_ve_export,
          name_feuille:  'VE',
          name_file: 'PR_VE_'   + this.projet.ancronyme + '-' + this.user[this.user.length - 1].id_equipe + this.user[this.user.length - 1].nom + '_' +this.user[this.user.length - 1].prenom
        },
        {
          data: this.data_ve_specu_export,
          name_feuille:  'Speculation VE',
          name_file: 'PR_VE_'  + this.projet.ancronyme + '-' + this.user[this.user.length - 1].id_equipe + this.user[this.user.length - 1].nom + '_' +this.user[this.user.length - 1].prenom
        }  
      ];
      this.dataExport.onExport(export_ve);
    }
  }
  /****************************
   * Load Export
   ****************************/
  loadExportAnimation(data_export_anime: Loc_AnimationVe[]) {

    this.data_animation_export = [];
    this.data_anime_specu_export = [];
    if(data_export_anime.length > 0) {
      data_export_anime.forEach(elem_anime => {
        let specu_anime: Loc_AnimationSpecu[] = elem_anime.specu_animation;
        this.data_animation_export.push({
          'Type': 'Animation',
          'Tech Responsable': this.user[this.user.length - 1].nom + '  ' + this.user[this.user.length - 1].prenom,
          'Code pr': elem_anime.code_pr, 
          'Nom': elem_anime.nom + ' ' + elem_anime.prenom, 
          'Dt_nais': elem_anime.date_naissance,
          'CIN': elem_anime.cin,
          'Code_Anime': elem_anime.code_anime,
          'Dt Anime': elem_anime.date_anim,
          'Commune_anime': elem_anime.commune,
          'Fokontany_Anime': elem_anime.fokontany,
          'Nb_participant': elem_anime.nb_participant,
          'Nb_F': elem_anime.nb_f,
          'Nb_H': elem_anime.nb_h,
          'Nb<25': elem_anime.nb_inf_25,
          'Nb_Specu': elem_anime.nb_specu
        });
        if (specu_anime.length > 0) {
          specu_anime.forEach(elem_specu => {
            this.data_anime_specu_export.push({
                'Code_anime': elem_anime.code_anime,
                'dt_anime': elem_anime.date_anim,
                'Commune_anime' : elem_anime.commune,
                'Fokontany': elem_anime.fokontany,
                'Code_PR': elem_anime.code_pr,
                'Nom': elem_anime.nom + ' ' + elem_anime.prenom, 
                'Speculation': elem_specu.speculation,
                'Quantité': elem_specu.quantite,
                'Unité': null
            });
          });
        }
      });
    }
  }
  loadExportVe(data_export_ve) {
    this.data_ve_export = [];
    this.data_ve_specu_export = [];
    if(data_export_ve.length > 0) {
      data_export_ve.forEach(elem_ve => {
        let specu_ve: Loc_AnimationSpecu[] = elem_ve.specu_animation;
        this.data_ve_export.push({
          'Type': 'VE',
          'Tech Responsable': this.user[this.user.length - 1].nom + '  ' + this.user[this.user.length - 1].prenom,
          'Code pr': elem_ve.code_pr, 
          'Nom': elem_ve.nom + ' ' + elem_ve.prenom, 
          'Dt_nais': elem_ve.date_naissance,
          'CIN': elem_ve.cin,
          'Code_Anime': elem_ve.code_anime,
          'Dt Anime': elem_ve.date_anim,
          'Commune_anime': elem_ve.commune,
          'Fokontany_Anime': elem_ve.fokontany,
          'Nb_participant': elem_ve.nb_participant,
          'Nb_F': elem_ve.nb_f,
          'Nb_H': elem_ve.nb_h,
          'Nb<25': elem_ve.nb_inf_25,
          'Nb_Specu': elem_ve.nb_specu
        });
        if (specu_ve.length > 0) {
          specu_ve.forEach(elem_specu => {
            this.data_ve_specu_export.push({
                'Code_anime': elem_ve.code_anime,
                'dt_anime': elem_ve.date_anim,
                'Commune_anime' : elem_ve.commune,
                'Fokontany': elem_ve.fokontany,
                'Code_PR': elem_ve.code_pr,
                'Nom': elem_ve.nom + ' ' + elem_ve.prenom, 
                'Speculation': elem_specu.speculation,
                'Quantité': elem_specu.quantite,
                'Unité': null
            });
          });
        }
      });
    }
  }

  onUpdate() {
    this.isUpdate = true;
  }
  onEditElement(data: any) {
    this.indexRowEdit = data.index;
    this.onPresentModal(data);
  }

  onClick() {
    console.log("console beneficiaire::::");
    this.router.navigate(['homes']);
  }

  onAdd() {
    let data = {
      src: 'add'
    };
    this.onPresentModal(data);
  }

  // Delete
  onDeleteAnimationVe(element) {
    let elem_animationVe: Loc_AnimationVe = element;
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '500px',
      data: {
        elem_animationve_pr: elem_animationVe
      }
    });
    dialogRef.afterClosed().subscribe(async result => {
      if (result != undefined) {
        if (elem_animationVe.etat === SYNC) {
          const loading = await this.loadingCtrl.create();
          await loading.present();
          
          let specu_animeVe: Loc_AnimationSpecu[] = elem_animationVe.specu_animation;
          let code_animeVe = {
            code_animeVe: elem_animationVe.code_anime
          }
          if (specu_animeVe.length > 0) {
            this.crudData.deleteSpecuAnimeVe(elem_animationVe.code_anime).then(result_del => {
              // Delete animation
              this.crudData.deleteAnimationVe(code_animeVe).then(res => {
                // Refresh
                setTimeout(async () => {
                  this.loadAnimation();
                  this.loadingCtrl.dismiss();
                }, 500);
              });
            });
          } else {
            // Delete animation
            this.crudData.deleteAnimationVe(code_animeVe).then(res => {
              // Refresh
              setTimeout(async () => {
                this.loadAnimation();
                this.loadingCtrl.dismiss();
              }, 500);
            });
          }
        }
      }
    });
  }

  // Save add Animation
  onCancelAnime() {
    this.isAddAnimation = false;
    this.update_animeve = <AnimetionVe>{};
  }
  onSaveAnime(src_: string) {
    this.isAddAnimation = false;
    console.log(":::Update Animation Ve:::", this.update_animeve);
    let img_piece: string[] = [];
    let code_anime: string;
    if (this.update_animeve.img_piece != null) {
      this.update_animeve.img_piece.forEach(item => {
        img_piece.push(item.data);
      });
    }
    let addAnimation : UpdateAnimationVe = {
      code: '',
      id_pr: this.update_animeve.pr.code_pr,
      id_fkt: this.update_animeve.fokontany != null?this.update_animeve.fokontany.code_fkt:null,
      id_commune: this.update_animeve.village != null?this.update_animeve.commune.code_com:null ,
      village: this.update_animeve.village,
      date_anim: this.update_animeve.dt_anime,
      nb_participant: this.update_animeve.nb_participant,
      nb_h: this.update_animeve.nb_homme,
      nb_f: this.update_animeve.nb_femme,
      nb_inf_25: this.update_animeve.nb_inf_25,
      type: '',
      img_piece: img_piece.length > 0?JSON.stringify(img_piece.join("-")):null,
      img_group_particip: null,
      id_tech_recenseur: this.user[this.user.length - 1].id_equipe,
      etat: SYNC,
      status: ACTIVE
    }
    if (src_ === 'animation') {
      code_anime = this.user[this.user.length - 1].id_equipe + this.projet.ancronyme  + '-' + 'ANIME' + '-' + moment().format('YYYYMMDD-HHmmss');
      addAnimation.code = code_anime;
      addAnimation.type = ANIMATION;
    } else if (src_ === 've') {
      code_anime = this.user[this.user.length - 1].id_equipe + this.projet.ancronyme  + '-' + 'VE' + '-' + moment().format('YYYYMMDD-HHmmss');
      addAnimation.code = code_anime;
      addAnimation.type = VE;
    }
    console.log("Data to Add:::", addAnimation);
    this.crudData.AddAnimationVe(addAnimation).then(res => {
      console.log("Animation Add Ve::", this.update_animeve.speculation);
      if (this.update_animeve.speculation != null) {
        this.update_animeve.speculation.forEach(item => {
          let add_specu: UpdateAnimeSpecu = {
            code_specu: 0,
            id_anime_ve: code_anime,
            id_var: item.variette != null ? item.variette.code_var : null,
            id_espece: item.variette != null ? null : item.espece.code_espece,
            quantite: item.quantite,
            etat: SYNC,
            status: ACTIVE
          }
          console.log("data Specu to Add:::", add_specu);
          this.crudData.AddAnimationVe_specu(add_specu).then(res => {
            console.log("Added speculation::::");
          });
        });
      }
      setTimeout(() => {
        this.loadAnimation();
        this.update_animeve = <AnimetionVe>{};
      },  500);
    });
  }

  // on Edit anime
  onCancelEdit() {
    this.isRowEditAnimation = false;
    this.indexRowEdit = null;
    this.update_animeve = <AnimetionVe>{};
  }
  onSaveEdit(element: Loc_AnimationVe) {
    console.log("::Element Edit:::", element);
    console.log("::Element To Update Edit:::", this.update_animeve);
    let img_piece: string[] = [];
    if (this.update_animeve.img_piece != null) {
      this.update_animeve.img_piece.forEach(item => {
        img_piece.push(item.data);
      });
    }
    let updateAnimation : UpdateAnimationVe = {
      code: element.code_anime,
      id_pr: this.update_animeve.pr.code_pr,
      id_fkt: this.update_animeve.fokontany != null?this.update_animeve.fokontany.code_fkt:null,
      id_commune: this.update_animeve.village != null?this.update_animeve.commune.code_com:null ,
      village: this.update_animeve.village,
      date_anim: this.update_animeve.dt_anime,
      nb_participant: this.update_animeve.nb_participant,
      nb_h: this.update_animeve.nb_homme,
      nb_f: this.update_animeve.nb_femme,
      nb_inf_25: this.update_animeve.nb_inf_25,
      type: element.type,
      img_piece: img_piece.length > 0?JSON.stringify(img_piece.join("-")):null,
      img_group_particip: null,
      id_tech_recenseur: this.user[this.user.length - 1].id_equipe,
      etat: element.etat === SYNC?SYNC:UPDATE,
      status: ACTIVE
    }
    this.crudData.UpdateAnimationVe(updateAnimation).then(res => {
      console.log(":::Animation Updated:::Specu Delete::::", this.update_animeve.specu_delete);
      // Delete speculation Animation
      if (this.update_animeve.specu_delete != null) {
        if (this.update_animeve.specu_delete.length > 0) {
          this.update_animeve.specu_delete.forEach((elem_del, ind) => {
            this.crudData.DeleteAnimationVe_specu(elem_del).then(res => {
              if ((this.update_animeve.specu_delete.length - 1) === ind) {
                console.log("::::Delete Success:::");
              }
            });
          });
        }
      }
      // Add new speculation
      console.log(":::::Add Specu Edit::", this.update_animeve.specu_add_edit);
      if (this.update_animeve.specu_add_edit != null) {
        this.update_animeve.specu_add_edit.forEach(item => {
          let add_specu: UpdateAnimeSpecu = {
            code_specu: 0,
            id_anime_ve: element.code_anime,
            id_var: item.variette != null ? item.variette.code_var : null,
            id_espece: item.variette != null ? null : item.espece.code_espece,
            quantite: item.quantite,
            etat: SYNC,
            status: ACTIVE
          }
          console.log("data Specu to Add:::", add_specu);
          this.crudData.AddAnimationVe_specu(add_specu).then(res => {
            console.log("Added speculation::::");
          });
        });
      }
      this.loadAnimation();
      this.update_animeve = <AnimetionVe>{};
    });
    this.isRowEditAnimation = false;
    this.indexRowEdit = null;
  }

  loadAnimation() {
    let data = {
      code_projet: this.projet.code_proj,
      code_equipe: this.user[this.user.length - 1].id_equipe
    }

    this.data_anime_specu = [];
    this.data_animation_ve = [];
    this.src_animation = [];
    this.src_ve = [];

    this.loadData.loadAnimeSpecu(data).then(res => {
      console.log(":::::Load Animation Specu::::", res);
      if (res.values.length > 0) {
        res.values.forEach(elem => { 
          this.data_anime_specu.push(elem);
        });
      }
    });
    this.loadData.loadAnimationVe(data).then(res => {
      console.log(":::::Load Animation Ve:::", res);
      //this.data_animation_ve = res.values;
      if (res.values.length > 0) {
        res.values.forEach(elem => {
          this.data_animation_ve.push(elem);
        });
        if (this.data_animation_ve.length > 0) {
          this.data_animation_ve.forEach(item => {
            item.specu_animation = this.data_anime_specu.filter(item_specu => {return item_specu.id_anime_ve === item.code_anime});
          });
        }
        if (this.data_animation_ve.length > 0) {
          this.src_animation = this.data_animation_ve.filter(item => {return item.type.toLowerCase() === ANIMATION});
          this.src_ve = this.data_animation_ve.filter(item => {return item.type.toLowerCase() === VE});
          this.loadExportAnimation(this.src_animation);
          this.loadExportVe(this.src_ve);
        }
        console.log(":::::DATA ANIMATION VE::", this.data_animation_ve);
        console.log(":::::DATA VE FILTRE::", this.src_ve);
        console.log(":::::DATA ANIMATION FILTRE::", this.src_animation);
      }
      this.dataSourceAnimation.data = this.src_animation;
      this.dataSourceVe.data = this.src_ve;
    });
  }

  toggleTableRows(data: any) {
    this.isTableAnimationExpanded = !this.isTableAnimationExpanded;
    if (data === 'animation') {
      this.dataSourceAnimation.data.forEach(row => {
        if (row.specu_animation.length > 0) {
          row.isExpanded = this.isTableAnimationExpanded;
        } else {
          if (row.isExpanded) {
            row.isExpanded = false;
          }
        }
      });
    } else if (data === 've') {
      this.dataSourceVe.data.forEach(row => {
        if (row.specu_animation.length > 0) {
          row.isExpanded = this.isTableAnimationExpanded;
        } else {
          if (row.isExpanded) {
            row.isExpanded = false;
          }
        }
      });
    }
  }

  // Event selected matgroupe
  async selectMatTab(index: number) {
    this.isTableAnimationExpanded = false;
    this.onFinish();
    if (index == 0) {
      console.log("selected index 0*******");
    } else if (index == 1) {
      console.log("selected index 1*******");
    } 
  }

  async onPresentModal(data: any) {
    let data_: any;
    if (data.src === 'add') {
      data_ = {
        isAnimationVe: true,
        isAddAnimeVe: true,
        zone: {
          region: this.data_region,
          district: this.data_district,
          commune: this.data_commune,
          fokontany: this.data_fokontany
        },
        pr: this.data_pr,
        categorie:  this.data_categ,
        espece: this.data_espece,
        variette: this.data_var
      }
    } else if (data.src === 'edit') {
      //let data_ = {src: 'add', data: element, index: i};
      data_ = { 
        isAnimationVe: true,
        isEditAnimeVe: true,
        zone: {
          region: this.data_region,
          district: this.data_district,
          commune: this.data_commune,
          fokontany: this.data_fokontany
        },
        pr: this.data_pr,
        element: data.data,
        categorie:  this.data_categ,
        espece: this.data_espece,
        variette: this.data_var
      }
    }
    let modal = await this.modalCtrl.create({
      component: ModalPrPage,
      cssClass: 'modal-custum-pr',
      backdropDismiss: true,
      componentProps: data_
    });
    modal.onDidDismiss().then(data_modal => {
      console.log("Modal Dismissed!!", data_modal.data);
      if (data_modal.data != undefined) {
        console.log("Modal Data with data", data_modal.data);
        this.update_animeve = data_modal.data;
        this.update_animeve.dt_anime = data_modal.data.dt_anime != null? data_modal.data.dt_anime.format("YYYY-MM-DD"): data_modal.data.dt_anime;
        
        if (data.src === 'add') {
          this.isAddAnimation = true;
        } else if (data.src === 'edit') {
          this.isRowEditAnimation = true;
        }
      }
    });
    await modal.present();
  }

  // load Zone
  // loadZone
  loadZone() {
    this.loadData.loadRegion().subscribe(res => {
      if (res.length > 0) {
        res.forEach(item => {
          this.data_region.push(item);
        });
      }
    });
    this.loadData.loadAllDistrict().then(res => {
      let dist: Loc_district[] = res.values;
      if (dist.length > 0) {
        dist.forEach(item => {
          this.data_district.push(item);
        });
      }
    });
    this.loadData.loadCommune({}).then(res => {
      let commune: Loc_Commune[] = res.values;
      if (commune.length > 0) {
        commune.forEach(item => {
          this.data_commune.push(item);
        });
      }
    });
    this.loadData.loadFokontany({}).then(res => {
      let fkt: Loc_Fokontany[] = res.values;
      if (fkt.length > 0) {
        fkt.forEach(elem => {
          this.data_fokontany.push(elem);
        });
      }
    });
  }

  // load Speculation
  loadSpeculation() {
    // load Categorie Espece
    this.loadData.loadCategEspece().then(res_categorie => {
      console.log(res_categorie);
      if (res_categorie.values.length > 0) {
        res_categorie.values.forEach(elem => {
          this.data_categ.push(elem);
        });
      }
    });
    // load Espece
    this.loadData.loadEspece().then(res_Espec => {
      console.log(res_Espec);
      if (res_Espec.values.length > 0) {
        res_Espec.values.forEach(elem_esp => {
          this.data_espece.push(elem_esp);
        });
      }
    });
    // load variette
    this.loadData.loadVariette().then(res_var => {
      console.log(res_var);
      if (res_var.values.length > 0) {
        res_var.values.forEach(elem_var => {
          this.data_var.push(elem_var);
        });
      }
    });
  }

  // load Parcelle
  loadPRBloc() {
    let data = {
      code_projet: this.projet.code_proj,
      id_tech: this.user[this.user.length - 1].id_equipe
    }
    
    this.loadData.loadPRBloc(data).then(res => {
      console.log("Response PR::", res.values);
      this.data_pr = res.values;
    });
  }

}

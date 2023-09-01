import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { LoadingController, ModalController } from '@ionic/angular';
import { UpdateMepPR, UpdateSuiviMepPR } from 'src/app/interfaces/interface-insertDb';
import { Find_suivi_MepPR, Loc_activ_projet, Loc_AnneeAgricole, Loc_categEspece, Loc_cep_PR, Loc_Espece, Loc_export_excel, Loc_MepPR, Loc_MepPr_info, Loc_PR, Loc_projet, Loc_saison, Loc_Suivi_MepPR, Loc_variette, Update_FormModal_Suivi_Mep_Bloc } from 'src/app/interfaces/interfaces-local';
import { LoadDataService } from 'src/app/services/local/load-data.service';
import { ACTIVE, EC, EC_CULTURAL, MV, PA, SG, STC, SYNC, UPDATE } from 'src/app/utils/global-variables';
import { Utilisateurs } from 'src/app/utils/interface-bd';
import { ModalPrPage } from '../../modals/modal-pr/modal-pr.page';
import * as _moment from 'moment';
import { CrudDbService } from 'src/app/services/local/crud-db.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CaptureImageService } from 'src/app/services/capture-image.service';
import { ExportExcelService } from 'src/app/services/export-excel.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from 'src/app/component/dialog/dialog.component';
const moment = _moment;

interface Update_Mep {
  annee: Loc_AnneeAgricole,
  saison: Loc_saison,
  beneficiaire: Loc_PR,
  parcelle: Loc_cep_PR,
  ddp: string,
  qso: number,
  dt_distribution: string,
  dds: string,
  sfce: number,
  nbre_ligne: number,
  long_ligne: number,
  sc: any,
  categorie_ea: Loc_categEspece,
  espece: Loc_Espece,
  espece_ea: Loc_Espece,
  variette: Loc_variette,
  variette_ea: Loc_variette,
  autreCultureEa: string
}

@Component({
  selector: 'app-suivi-pr',
  templateUrl: './suivi-pr.page.html',
  styleUrls: ['./suivi-pr.page.scss'],
  animations: [ //utiliser pour @detailExpand (table expendable)
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ])
  ]
})
export class SuiviPrPage implements OnInit {
  private projet: Loc_projet;
  private user: Utilisateurs[];
  private activite: Loc_activ_projet;

  updated_Mep: Update_Mep = {
    annee: null,
    saison: null,
    beneficiaire: null,
    parcelle: null,
    ddp: null,
    qso: null,
    dt_distribution: null,
    dds: null,
    sfce: null,
    nbre_ligne: null,
    long_ligne: null,
    sc: null,
    categorie_ea: null,
    espece: null,
    espece_ea: null,
    variette: null,
    variette_ea: null,
    autreCultureEa: null
  };
  updated_Suivi: Update_FormModal_Suivi_Mep_Bloc = <Update_FormModal_Suivi_Mep_Bloc>{};

  data_saison: Loc_saison[]  = [];
  data_espece: Loc_Espece[] = [];
  data_var: Loc_variette[] = [];
  data_categ: Loc_categEspece[] = [];
  data_pr: Loc_PR[] = [];
  data_parce: Loc_cep_PR[] = [];

  data_mep_pr: Loc_MepPR[] = [];
  mep_sg: Loc_MepPR[] = [];
  mep_pa: Loc_MepPR[] = [];
  mep_mv: Loc_MepPR[] = [];
  data_annee_agricole: Loc_AnneeAgricole[] = [];

  displayedColumnsMepSgInfo: string[] = ['annee', 'code_benef', 'nom', 'dt_naissance', 'cin', 'code_parce', 'lat', 'log', 'sfce_reel', 'action'];
  displayedColumnsMepSg: string[] = ['saison', 'code_mep', 'ddp', 'variette', 'qso', 'dds', 'sc', 'sfce_embl', 'nb_ligne', 'long_ligne', 'ea', 'action'];
  displayedColumnsMepPaInfo: string[] = ['annee', 'code_benef', 'nom', 'dt_naissance', 'cin', 'code_parce', 'lat', 'log', 'sfce_reel', 'action'];
  displayedColumnsMepPa: string[] = ['code_mep', 'ddp', 'espece', 'qso', 'dt_dist', 'dds', 'nbre_ligne', 'long_ligne', 'action'];
  displayedColumnsMepMvInfo: string[] = ['annee', 'code_benef', 'nom', 'dt_naissance', 'cin', 'code_parce', 'lat', 'log', 'sfce_reel', 'action'];
  displayedColumnsMepMv: string[] = ['saison', 'code_mep', 'ddp', 'espece', 'qso', 'dds', 'sfce_embl', 'nbre_ligne', 'long_ligne', 'sc', 'ea', 'action'];
  // displayed newMepSg
  displayedColumnsNewMepSg: string[] = ['new_saison', 'new_code_mep', 'new_ddp', 'new_variette', 'new_qso', 'new_dds', 'new_sc', 'new_sfce_embl', 'new_nb_ligne', 'new_long_ligne', 'new_ea', 'new_action'];
  displayedColumnsNewMepPa: string[] = ['new_code_mep', 'new_ddp', 'new_espece', 'new_qso', 'new_dt_dist', 'new_dds', 'new_nbre_ligne', 'new_long_ligne', 'new_action'];
  displayedColumnsNewMepMv: string[] = ['new_saison', 'new_code_mep', 'new_ddp', 'new_espece', 'new_qso', 'new_dds', 'new_sfce_embl', 'new_nbre_ligne', 'new_long_ligne', 'new_sc', 'new_ea', 'new_action'];
  // displayed column suivi
  displayedColumnsSvSg: string[] = ['ddp', 'stc', 'etat_cultural', 'long_ligne', 'nbre_ligne', 'img', 'ex'];
  displayedColumnsSvPa: string[] = ['ddp', 'ql', 'qr', 'etat_pa', 'nb_ligne', 'hauteur', 'img_cult'];
  displayedColumnsSvMv: string[] = ['code_sv', 'ddp', 'nbre_pied', 'Long_ligne', 'nbre_ligne', 'ex'];
  // new sv
  displayedColumnsNewSvSg: string[] = ['new_ddp', 'new_stc', 'new_etat_cultural', 'new_long_ligne', 'new_nbre_ligne', 'new_img', 'new_ex', 'new_action'];
  displayedColumnsNewSvPa: string[] = ['new_ddp', 'new_ql', 'new_qr', 'new_etat_pa', 'new_nb_ligne', 'new_hauteur', 'new_img_cult', 'new_action'];
  displayedColumnsNewSvMv: string[] = ['new_code_sv', 'new_ddp', 'new_nbre_pied', 'new_Long_ligne', 'new_nbre_ligne', 'new_ex','new_action'];

  dataSourceMepSgInfo = new MatTableDataSource<Loc_MepPr_info>();
  dataSourceMepPaInfo = new MatTableDataSource<Loc_MepPr_info>();
  dataSourceMepMvInfo = new MatTableDataSource<Loc_MepPr_info>();

  data_mep_info_sg: Loc_MepPr_info[] = [];
  data_mep_info_pa: Loc_MepPr_info[] = [];
  data_mep_info_mv: Loc_MepPr_info[] = [];

  isTableSgExpanded = false;
  isTablePaExpanded = false;
  isTableMvExpanded = false;

  isUpdated: boolean = false;
  isAddSg: boolean = false;
  isAddPa: boolean = false;
  isAddMv: boolean = false;
  //Edit
  isEditRowSg: boolean = false;
  isEditRowPa: boolean = false;
  isEditRowMv: boolean = false;
  // 
  isAddSvSg: boolean = false;
  isAddSvPa: boolean = false;
  isAddSvMv: boolean = false;
    // 
  isEditSvSg: boolean = false;
  isEditSvPa: boolean = false;
  isEditSvMv: boolean = false;
  //index Row Mep suivi
  indexRowMepSgInfo: number;
  indexRowMepPaInfo: number;
  indexRowMepMvInfo: number;
  // index
  indexRowMepSg: number;
  indexRowMepPa: number;
  indexRowMepMv: number;
  // ind Row suivi
  indexRowMepSvSg: number;
  indexRowMepSvPa: number;
  indexRowMepSvMv: number;

  data_stc: any[] = STC;
  data_ec: any[] = EC_CULTURAL;
  
  selectedAnnee: any;
  data_annee_filter: Loc_AnneeAgricole[] = [];

  mep_export_sg: any[] = [];
  mep_export_pa: any[] = [];
  mep_export_mv: any[] = [];

  suivi_export_sg: any[] = [];
  suivi_export_pa: any[] = [];
  suivi_export_mv: any[] = [];

  etat_sync = SYNC;

  constructor(
    private router: Router,
     private loadData: LoadDataService,
     private modalCtrl: ModalController,
     private crudDb: CrudDbService,
     private loadingCtrl: LoadingController,
     private serviceExport: ExportExcelService,
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
          this.loadMep();
          this.loadDataInitial();
          this.loadPRBloc();
        }
    }

  ngOnInit() {}
  /********************
   * Action btn
   *********************/
   async onUpdate() {
    const loading = await this.loadingCtrl.create();
    await loading.present();
    setTimeout(() => {
      this.isUpdated = true;
      this.displayedColumnsSvSg.push('action');
      this.displayedColumnsSvPa.push('action');
      this.displayedColumnsSvMv.push('action');
      this.loadingCtrl.dismiss();
    }, 500);
   }
   async onFinished() {
    const loading = await this.loadingCtrl.create();
    await loading.present();
    setTimeout(async () => {
      this.isUpdated = true;
      this.isUpdated = false;

      if (this.isAddSg) {
        this.indexRowMepSgInfo = null;
        this.isAddSg = false;
        this.initUpdatedMep();
      }
      if (this.isAddPa) {
        this.indexRowMepPaInfo = null;
        this.isAddPa = false;
        this.initUpdatedMep();
      }
      if (this.isAddMv) {
        this.indexRowMepMvInfo = null;
        this.isAddMv = false;
        this.initUpdatedMep();
      }

      // 
      if (this.isEditRowSg) {
        this.indexRowMepSgInfo = null;
        this.isEditRowSg = false;
        this.indexRowMepSg = null;
        this.initUpdatedMep();
      }
      if (this.isEditRowPa) {
        this.indexRowMepPaInfo = null;
        this.isEditRowPa = false;
        this.indexRowMepPa = null;
        this.initUpdatedMep();
      }
      if (this.isEditRowMv) {
        this.indexRowMepMvInfo = null;
        this.isEditRowMv = false;
        this.indexRowMepMv = null;
        this.initUpdatedMep();
      }
      /////
      if ( this.isAddSvSg) {
        this.isAddSvSg = false;
        this.updated_Suivi = <Update_FormModal_Suivi_Mep_Bloc>{};
        this.indexRowMepSg = null;
        this.indexRowMepSgInfo = null;
      }
      if (this.isAddSvPa) {
        this.isAddSvPa = false;
        this.updated_Suivi = <Update_FormModal_Suivi_Mep_Bloc>{};
        this.indexRowMepPa = null;
        this.indexRowMepPaInfo = null;
      }
      if (this.isAddSvMv) {
        this.isAddSvMv = false;
        this.updated_Suivi = <Update_FormModal_Suivi_Mep_Bloc>{};
        this.indexRowMepMv = null;
        this.indexRowMepMvInfo = null;
      }
      //
      if (this.isEditSvSg) {
        this.isEditSvSg = false;
        this.indexRowMepSvSg = null;
        this.indexRowMepSg = null;
        this.updated_Suivi = <Update_FormModal_Suivi_Mep_Bloc>{};
        this.indexRowMepSgInfo = null;
      }
      if (this.isEditSvPa) {
        this.isEditSvPa = false;
        this.indexRowMepSvPa = null;
        this.indexRowMepPa = null;
        this.updated_Suivi = <Update_FormModal_Suivi_Mep_Bloc>{};
        this.indexRowMepPaInfo = null;
      }
      if (this.isEditSvMv) {
        this.isEditSvMv = false;
        this.indexRowMepSvMv = null;
        this.indexRowMepMv = null;
        this.updated_Suivi = <Update_FormModal_Suivi_Mep_Bloc>{};
        this.indexRowMepMvInfo = null;
      }
      
      // 
      this.displayedColumnsSvSg.pop();
      this.displayedColumnsSvPa.pop();
      this.displayedColumnsSvMv.pop();
      this.loadingCtrl.dismiss();
    }, 400);
   }
   /***********************************
    * Filtre
    ***********************************/
   applyFilterSelect(data: any, src: any) {

    if (data != undefined) {
      if (src === 'annee') {
        let filter_annee: Loc_AnneeAgricole = data;
        let mep_sg_info_filter = this.data_mep_info_sg.filter(item_info_sg => {return item_info_sg.id_annee === filter_annee.code});
        let mep_pa_info_filter = this.data_mep_info_pa.filter(item_info_pa => {return item_info_pa.id_annee === filter_annee.code});
        let mep_mv_info_filter = this.data_mep_info_mv.filter(item_info_mv => {return item_info_mv.id_annee === filter_annee.code});
    
        let mep_export_sg = this.mep_sg.filter(item_mep_sg => {return item_mep_sg.id_annee === filter_annee.code});
        let mep_export_pa = this.mep_pa.filter(item_mep_pa => {return item_mep_pa.id_annee === filter_annee.code});
        let mep_export_mv = this.mep_mv.filter(item_mep_mv => {return item_mep_mv.id_annee === filter_annee.code});
    
        this.loadExportSg(mep_export_sg);
        this.loadExportPa(mep_export_pa);
        this.loadExportMv(mep_export_mv);
        
        this.dataSourceMepSgInfo.data  = mep_sg_info_filter;
        this.dataSourceMepPaInfo.data = mep_pa_info_filter;
        this.dataSourceMepMvInfo.data = mep_mv_info_filter;
      }
    }

   }

   applyFilterTout(source: any) {
    if(source == 'annee') {
      this.loadExportSg(this.mep_sg);
      this.loadExportPa(this.mep_pa);
      this.loadExportMv(this.mep_mv);

      this.dataSourceMepSgInfo.data  = this.data_mep_info_sg;
      this.dataSourceMepPaInfo.data = this.data_mep_info_pa;
      this.dataSourceMepMvInfo.data = this.data_mep_info_mv;
    }
   }

   onExport(parent) {
    switch(parent) {
      case 'mep-sg':
        console.log(":::::Export SG::::::");
        let data_export_sg: Loc_export_excel[] = [
          {
            data: this.mep_export_sg,
            name_feuille: 'MEP SG',
            name_file: 'PR_MEP_SG_' + this.user[this.user.length - 1].id_equipe + this.projet.ancronyme
          },
          {
            data: this.suivi_export_sg,
            name_feuille: 'Suivi SG',
            name_file: 'PR_MEP_SG_' + this.user[this.user.length - 1].id_equipe + this.projet.ancronyme
          }
        ];
        this.serviceExport.onExport(data_export_sg);
        break;
      case 'mep-pa':
        console.log(":::::Export PA::::::");
        let data_export_pa: Loc_export_excel[] = [
          {
            data: this.mep_export_pa,
            name_feuille: 'MEP PA',
            name_file: 'PR_MEP_PA_' + this.user[this.user.length - 1].id_equipe + this.projet.ancronyme
          },
          {
            data: this.suivi_export_pa,
            name_feuille: 'Suivi PA',
            name_file: 'PR_MEP_PA_' + this.user[this.user.length - 1].id_equipe + this.projet.ancronyme
          }
        ];
        this.serviceExport.onExport(data_export_pa);
        break;
      case 'mep-mv':
        console.log(":::::Export MV::::::");
        let data_export_mv: Loc_export_excel[] = [
          {
            data: this.mep_export_mv,
            name_feuille: 'MEP MV',
            name_file: 'PR_MEP_MV_' + this.user[this.user.length - 1].id_equipe + this.projet.ancronyme
          },
          {
            data: this.suivi_export_mv,
            name_feuille: 'Suivi MV',
            name_file: 'PR_MEP_MV_' + this.user[this.user.length - 1].id_equipe + this.projet.ancronyme
          }
        ];
        this.serviceExport.onExport(data_export_mv);
        break;
      case 'tout':
        console.log("::::Tout exdporter::::");
        let data_export_mep: Loc_export_excel[] = [
          {
            data: this.mep_export_sg,
            name_feuille: 'MEP SG',
            name_file: 'PR_MEP_' + this.user[this.user.length - 1].id_equipe + this.projet.ancronyme
          },
          {
            data: this.suivi_export_sg,
            name_feuille: 'Suivi SG',
            name_file: 'PR_MEP_' + this.user[this.user.length - 1].id_equipe + this.projet.ancronyme
          },
          {
            data: this.mep_export_pa,
            name_feuille: 'MEP PA',
            name_file: 'PR_MEP_' + this.user[this.user.length - 1].id_equipe + this.projet.ancronyme
          },
          {
            data: this.suivi_export_pa,
            name_feuille: 'Suivi PA',
            name_file: 'PR_MEP_' + this.user[this.user.length - 1].id_equipe + this.projet.ancronyme
          },
          {
            data: this.mep_export_mv,
            name_feuille: 'MEP MV',
            name_file: 'PR_MEP_' + this.user[this.user.length - 1].id_equipe + this.projet.ancronyme
          },
          {
            data: this.suivi_export_mv,
            name_feuille: 'Suivi MV',
            name_file: 'PR_MEP_' + this.user[this.user.length - 1].id_equipe + this.projet.ancronyme
          }
        ];
        this.serviceExport.onExport(data_export_mep);
        break;
      default:
        console.log("default")
        break;
    }
   }
   // Delete 
   onDeleteMepElement(element: any) {
    let elem_mep: Loc_MepPR = element;
    console.log("::::Element MEP Delete:::", elem_mep);
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '500px',
      data: {
        elem_mep_pr: elem_mep
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result != undefined) {
        if (elem_mep.etat_mep === SYNC) {
          let code_mep = {
            code_mep: elem_mep.code_culture
          }
          this.loadData.findSuiviMepPR(code_mep).then(result => {
            let data_suivi: Find_suivi_MepPR[] = result.values;
            if (data_suivi.length > 0) {
              this.crudDb.deleteSuiviMepPR(code_mep).then(result_del => {
                // Delete MEP
                this.crudDb.deleteMepPR(code_mep).then(res_mep => {
                  // refresh
                  this.loadMep();
                });
              });
            } else {
              // Delete MEP
              this.crudDb.deleteMepPR(code_mep).then(res_mep => {
                // refresh
                this.loadMep();
              });
            }
          });
        }
      }
    });
   }
   onDeleteSuiviElement(elem: any) {
    let elem_suivi: Loc_Suivi_MepPR = elem;
    console.log("::::Element SUIVI Delete:::", elem_suivi);
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '500px',
      data: {
        elem_suivi_pr: elem_suivi
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result != undefined) {
        let code_suivi = {
          code_suivi: elem_suivi.code_sv
        }
        this.crudDb.deleteSuiviMepPR(code_suivi).then(res_del => {
          // refresh
          this.loadMep();
        });
      }
    });
   }
   // On Add new Mep
   onAdd(parent) {
    let data = {
      saison: this.data_saison,
      pr: this.data_pr,
      parcelle: this.data_parce,
      categorie: this.data_categ,
      espece: this.data_espece,
      variette: this.data_var,
      annee_agricole: this.data_annee_agricole
    }
    switch(parent.src) {
      case 'mep-sg':
        console.log(":::::ADD SG::::::");
        let data_sg = {
          src: 'mep-sg',
          action: 'add',
          isNewParce: parent.isNewParce,
          data_initial: data,
          element_info: null,
          index_info: null
        }
        if (!parent.isNewParce) {
          data_sg.element_info = parent.element_info;
          data_sg.index_info = parent.ind_info;
        }
        this.onPresentModal(data_sg);
        //this.isAddSg = true;
        break;
      case 'mep-pa':
        console.log(":::::ADD PA::::::", parent);
        let data_pa = {
          src: 'mep-pa',
          action: 'add',
          isNewParce: parent.isNewParce,
          data_initial: data,
          element_info: null,
          index_info: null
        }
        if (!parent.isNewParce) {
          data_pa.element_info = parent.element_info;
          data_pa.index_info = parent.ind_info;
          console.log(":::::NEW PARCE ADD PA::::::" , data_pa);
        }
        this.onPresentModal(data_pa);
        //this.isAddPa = true;
        break;
      case 'mep-mv':
        console.log(":::::ADD MV::::::");
        let data_mv = {
          src: 'mep-mv',
          action: 'add',
          isNewParce: parent.isNewParce,
          data_initial: data,
          element_info: null,
          index_info: null
        }
        if (!parent.isNewParce) {
          data_mv.element_info = parent.element_info;
          data_mv.index_info = parent.ind_info;
        }
        this.onPresentModal(data_mv);
        //this.isAddMv = true;
        break;
      default:
        console.log("default");
        break;
    }
   }
   // on Edit
   onEditRow(parent: any) {
    console.log(":::::Edit SG::::::", parent);
    let data = {
      saison: this.data_saison,
      pr: this.data_pr,
      parcelle: this.data_parce,
      categorie: this.data_categ,
      espece: this.data_espece,
      variette: this.data_var,
      annee_agricole: this.data_annee_agricole
    }
    parent.data_initial = data;
    switch(parent.src) {
      case 'mep-sg':
        this.onPresentModal(parent);
        break;
      case 'mep-pa':
        this.onPresentModal(parent);
        break;
      case 'mep-mv':
        this.onPresentModal(parent);
        break;
      default:
        console.log("default");
        break;
    }
   }
   
   // on Edit Row suivi
   onEditRowSuivi(data: any) {
    // {src: 'mep-sg', row: element, index: ind}
    console.log("::::Data EditRow suivi::::", data);
    switch(data.src) {
      case 'mep-sg':
        this.indexRowMepSvSg = data.index;
        this.isEditSvSg = true;
        break;
      case 'mep-pa':
        this.indexRowMepSvPa = data.index;
        this.isEditSvPa = true;
        break;
      case 'mep-mv':
        this.indexRowMepSvMv = data.index;
        this.isEditSvMv = true;
        break;
      default:
        console.log("default");
        break;
    }
   }
  onCancelMep(data: any) {
    switch(data) {
      case 'mep-sg':
        this.indexRowMepSgInfo = null;
        this.isAddSg = false;
        this.initUpdatedMep();
        break;
      case 'mep-pa':
        this.indexRowMepPaInfo = null;
        this.isAddPa = false;
        this.initUpdatedMep();
        break;
      case 'mep-mv':
        this.indexRowMepMvInfo  = null;
        this.isAddMv = false;
        this.initUpdatedMep();
        break;
      default:
        console.log("default");
        break;
    }
  }
  onSaveMep(data: any) {
    let order: number = 1;
    let insert_Mep: UpdateMepPR = {
      code_culture: null,
      code_culture_temp: null,
      id_parce: this.updated_Mep.parcelle.code_parce,
      id_espece: null,
      id_var: null,
      id_saison: this.updated_Mep.saison != null ? this.updated_Mep.saison.code_saison : null,
      id_annee: this.updated_Mep.annee != null ? this.updated_Mep.annee.code : null,
      ddp: this.updated_Mep.ddp,
      qso: this.updated_Mep.qso,
      dt_distribution: this.updated_Mep.dt_distribution,
      dds: this.updated_Mep.dds,
      sfce: this.updated_Mep.sfce,
      nbre_ligne: this.updated_Mep.nbre_ligne,
      long_ligne: this.updated_Mep.long_ligne,
      sc: this.updated_Mep.sc != null ? this.updated_Mep.sc.value : null,
      ea_autres: this.updated_Mep.autreCultureEa,
      ea_id_variette: this.updated_Mep.variette_ea != null ? this.updated_Mep.variette_ea.code_var : null,
      dt_creation: moment().format("YYYY-MM-DD"),
      dt_modification: moment().format("YYYY-MM-DD"),
      status: ACTIVE,
      etat: SYNC,
      id_equipe: this.user[this.user.length - 1].id_equipe,
      type: null
    }
    switch(data) {
      case 'mep-sg':
        insert_Mep.code_culture = this.generateCodeMep() + SG.toUpperCase() + '-' + moment().format('YYYYMMDD-HHmmss');
        insert_Mep.id_var = this.updated_Mep.variette.code_var;
        insert_Mep.type = SG;
        
        let data_sg = {
          type: SG, 
          code_projet: this.projet.code_proj,
          code_equipe: this.user[this.user.length - 1].id_equipe,
          id_saison: this.updated_Mep.saison != null?this.updated_Mep.saison.code_saison:null, 
          annee_du: this.updated_Mep.annee != null?this.updated_Mep.annee.code:null
        }
        this.loadData.loadMepPR(data_sg).then(res_mep_pr => {
          let data_res_mep: Loc_MepPR[] = res_mep_pr.values;

          if (data_res_mep.length > 0) {
            data_res_mep.forEach((elem_mep, ind_mep) => {
              
              // find du boucle
              if ((data_res_mep.length - 1) === ind_mep) {
                let num_code_mep: string = '';
                //
                let code_mep = elem_mep.code_culture_temp;
                let arr_code_mep = code_mep.split('-');
                order = parseInt(arr_code_mep[arr_code_mep.length - 1]) + 1;

                if (order < 100) {
                  if (order < 10) {
                    num_code_mep = '00';
                  } else {
                    num_code_mep = '0';
                  }
                }
                insert_Mep.code_culture_temp = this.generateCodeMep() + SG.toUpperCase() + '-' + num_code_mep + order;
              }
            });
          } else {
            insert_Mep.code_culture_temp = this.generateCodeMep() + SG.toUpperCase() + '-' + '00' + order;
          }
          // Insert
          this.crudDb.AddMepPR(insert_Mep).then(res => {
            console.log("::::Mep SG PR Added::::");
            this.initUpdatedMep();
            this.loadMep();
          });
          this.indexRowMepSgInfo = null;
          this.isAddSg = false;
        });

        break;
      case 'mep-pa':
        insert_Mep.code_culture = this.generateCodeMep() + PA.toUpperCase() + '-' + moment().format('YYYYMMDD-HHmmss');
        insert_Mep.id_espece = this.updated_Mep.espece.code_espece;
        insert_Mep.type = PA;
        
        let data_pa = {
          type: PA, 
          code_projet: this.projet.code_proj,
          code_equipe: this.user[this.user.length - 1].id_equipe,
          annee_du: this.updated_Mep.annee != null?this.updated_Mep.annee.code:null
        }
        this.loadData.loadMepPR(data_pa).then(res_mep_pr => {
          let data_res_mep: Loc_MepPR[] = res_mep_pr.values;

          if (data_res_mep.length > 0) {
            data_res_mep.forEach((elem_mep, ind_mep) => {
              
              // find du boucle
              if ((data_res_mep.length - 1) === ind_mep) {
                let num_code_mep: string = '';
                
                //
                let code_mep = elem_mep.code_culture_temp;
                let arr_code_mep = code_mep.split('-');
                order = parseInt(arr_code_mep[arr_code_mep.length - 1]) + 1;

                if (order < 100) {
                  if (order < 10) {
                    num_code_mep = '00';
                  } else {
                    num_code_mep = '0';
                  }
                }
                insert_Mep.code_culture_temp = this.generateCodeMep() + PA.toUpperCase() + '-' + num_code_mep + order;
              }
            });
          } else {
            insert_Mep.code_culture_temp = this.generateCodeMep() + PA.toUpperCase() + '-' + '00' + order;
          }
          // Insert
          this.crudDb.AddMepPR(insert_Mep).then(res => {
            console.log("::::Mep PA PR Added::::");
            this.initUpdatedMep();
            this.loadMep();
          });
          this.indexRowMepPaInfo = null;
          this.isAddPa = false;
        });
        break;
      case 'mep-mv':
        insert_Mep.code_culture = this.generateCodeMep() + MV.toUpperCase() + '-' + moment().format('YYYYMMDD-HHmmss');
        insert_Mep.id_espece = this.updated_Mep.espece.code_espece;
        insert_Mep.type = MV;
        
        let data_mv: any = {
          type: MV, 
          code_projet: this.projet.code_proj,
          code_equipe: this.user[this.user.length - 1].id_equipe,
          annee_du: this.updated_Mep.annee != null?this.updated_Mep.annee.code:null
        };

        if (this.updated_Mep.saison != null) {
          data_mv.id_saison = this.updated_Mep.saison != null?this.updated_Mep.saison.code_saison:null;
        }
        this.loadData.loadMepPR(data_mv).then(res_mep_pr => {
          let data_res_mep: Loc_MepPR[] = res_mep_pr.values;

          if (data_res_mep.length > 0) {
            data_res_mep.forEach((elem_mep, ind_mep) => {
              
              // find du boucle
              if ((data_res_mep.length - 1) === ind_mep) {
                let num_code_mep: string = '';
                
                //
                let code_mep = elem_mep.code_culture_temp;
                let arr_code_mep = code_mep.split('-');
                order = parseInt(arr_code_mep[arr_code_mep.length - 1]) + 1;

                if (order < 100) {
                  if (order < 10) {
                    num_code_mep = '00';
                  } else {
                    num_code_mep = '0';
                  }
                }
                insert_Mep.code_culture_temp = this.generateCodeMep() + MV.toUpperCase() + '-' + num_code_mep + order;
              }
            });
          } else {
            insert_Mep.code_culture_temp = this.generateCodeMep() + MV.toUpperCase() + '-' + '00' + order;
          }
          // Insert
          this.crudDb.AddMepPR(insert_Mep).then(res => {
            console.log("::::Mep PA PR Added::::");
            this.initUpdatedMep();
            this.loadMep();
          });
          this.indexRowMepMvInfo = null;
          this.isAddMv = false;
        });

        break;
      default:
        console.log("default");
        break;
    }
  }
  onCancelEdit(data: any) {
    switch(data) {
      case 'mep-sg':
        this.indexRowMepSgInfo = null;
        this.indexRowMepSg = null;
        this.isEditRowSg = false;
        break;
      case 'mep-pa':
        this.indexRowMepPaInfo = null;
        this.indexRowMepPa = null;
        this.isEditRowPa = false;
        break;
      case 'mep-mv':
        this.indexRowMepMvInfo = null;
        this.indexRowMepMv = null;
        this.isEditRowMv = false;
        break;
      default:
        console.log("default");
        break;
    }
  }
  onSaveEdit(data){
    console.log("::::DATA MV EDIT:::", data);
    let elem_mep: Loc_MepPR = data.row;
    let update_Mep: UpdateMepPR = {
      code_culture: elem_mep.code_culture,
      code_culture_temp: elem_mep.code_culture_temp,
      id_parce: this.updated_Mep.parcelle.code_parce,
      id_espece: null,
      id_var: null,
      id_saison: this.updated_Mep.saison != null ? this.updated_Mep.saison.code_saison : null,
      id_annee: this.updated_Mep.annee != null ? this.updated_Mep.annee.code : null,
      ddp: this.updated_Mep.ddp,
      qso: this.updated_Mep.qso,
      dt_distribution: this.updated_Mep.dt_distribution,
      dds: this.updated_Mep.dds,
      sfce: this.updated_Mep.sfce,
      nbre_ligne: this.updated_Mep.nbre_ligne,
      long_ligne: this.updated_Mep.long_ligne,
      sc: this.updated_Mep.sc != null ? this.updated_Mep.sc.value : null,
      ea_autres: this.updated_Mep.autreCultureEa,
      ea_id_variette: this.updated_Mep.variette_ea != null ? this.updated_Mep.variette_ea.code_var : null,
      dt_creation: elem_mep.dt_creation,
      dt_modification: moment().format("YYYY-MM-DD"),
      status: ACTIVE,
      etat: elem_mep.etat_mep.toUpperCase() === SYNC.toUpperCase() ? SYNC : UPDATE,
      id_equipe: elem_mep.id_equipe,
      type: elem_mep.type
    }
    switch(data.src) {
      case 'mep-sg':
        update_Mep.id_var = this.updated_Mep.variette.code_var;
        let data_mep_update_sg: any = {
          isUpdateMepSuivi: true,
          data_mep: update_Mep
        }
        console.log("::::DATA TO SG UPDATE:::", data_mep_update_sg);
        this.crudDb.UpdatedMepPR(data_mep_update_sg).then(res => {
          console.log(":::Update SG::::", res);
          this.loadMep();
          this.indexRowMepSgInfo = null;
          this.indexRowMepSg = null;
          this.isEditRowSg = false;
        });
        break;
      case 'mep-pa':
        update_Mep.id_espece = this.updated_Mep.espece.code_espece;
        let data_mep_update_pa: any = {
          isUpdateMepSuivi: true,
          data_mep: update_Mep
        }
        console.log("::::DATA TO PA UPDATE:::", data_mep_update_pa);
        this.crudDb.UpdatedMepPR(data_mep_update_pa).then(res => {
          console.log(":::Update SG::::", res);
          this.loadMep();
          this.indexRowMepPaInfo = null;
          this.indexRowMepPa = null;
          this.isEditRowPa = false;
        });
        break;
      case 'mep-mv':
        update_Mep.id_espece = this.updated_Mep.espece.code_espece;
        let data_mep_update_mv: any = {
          isUpdateMepSuivi: true,
          data_mep: update_Mep
        }
        console.log("::::DATA TO MV UPDATE:::", data_mep_update_mv);
        this.crudDb.UpdatedMepPR(data_mep_update_mv).then(res => {
          console.log(":::Update SG::::", res);
          this.loadMep();
          this.indexRowMepMvInfo = null;
          this.indexRowMepMv = null;
          this.isEditRowMv = false;
        });
        break;
      default:
        console.log("default");
        break;
    }
  }
  // Save suivi
  onCancelAddSv(data: any) {
    switch(data) {
      case 'mep-sg':
        this.isAddSvSg = false;
        this.updated_Suivi = <Update_FormModal_Suivi_Mep_Bloc>{};
        this.indexRowMepSg = null;
        this.indexRowMepSgInfo = null;
        break;
      case 'mep-pa':
        this.isAddSvPa = false;
        this.updated_Suivi = <Update_FormModal_Suivi_Mep_Bloc>{};
        this.indexRowMepPa = null;
        this.indexRowMepPaInfo = null;
        break;
      case 'mep-mv':
        this.isAddSvMv = false;
        this.updated_Suivi = <Update_FormModal_Suivi_Mep_Bloc>{};
        this.indexRowMepMv = null;
        this.indexRowMepMvInfo = null;
        break;
      default:
        console.log("default");
        break;
    }
  }
  onSaveAddSv(data: any) {
    //{src: 'mep-sg', row_mep: element_mep}
    let elem_mep: Loc_MepPR = data.row_mep;
    console.log("::::SAVE DATA ELEMENT MEP:::::", data);
    let insert_suivi: UpdateSuiviMepPR = {
      code_sv: elem_mep.code_culture + '_' + moment().format('YYMMDD:HHmm'),
      id_culture: elem_mep.code_culture,
      ddp: this.updated_Suivi.ddp,
      stc: this.updated_Suivi.stc != null?this.updated_Suivi.stc.value:null,
      ql: this.updated_Suivi.ql,
      qr: this.updated_Suivi.qr,
      long_ligne: this.updated_Suivi.long_ligne,
      nbre_ligne: this.updated_Suivi.nbre_ligne,
      nbre_pied: this.updated_Suivi.nbre_pied,
      hauteur: this.updated_Suivi.hauteur,
      ec: this.updated_Suivi.ec != null?this.updated_Suivi.ec.value:null,
      img_cult: this.updated_Suivi.img_culture,
      dt_capture: null,
      ex: this.updated_Suivi.estimation,
      dt_creation: moment().format('YYYY-MM-DD'),
      dt_modification: moment().format('YYYY-MM-DD'),
      etat: SYNC
    }
    switch(data.src) {
      case 'mep-sg':
        this.crudDb.AddSuiviMepPR(insert_suivi).then(res => {
          console.log("::::SUIVI SG ADDED::");
          this.isAddSvSg = false;
          this.updated_Suivi = <Update_FormModal_Suivi_Mep_Bloc>{};
          this.indexRowMepSg = null;
          this.indexRowMepSgInfo = null;
          this.loadMep();
          console.log(":::Updated_Suivi::::", this.updated_Suivi);
        });
        break;
      case 'mep-pa':
        this.crudDb.AddSuiviMepPR(insert_suivi).then(res => {
          console.log("::::SUIVI MV ADDED::");
          this.isAddSvPa = false;
          this.indexRowMepPa = null;
          this.updated_Suivi = <Update_FormModal_Suivi_Mep_Bloc>{};
          this.indexRowMepPaInfo = null;
          this.loadMep();
          console.log(":::Updated_Suivi::::", this.updated_Suivi);
        });
        break;
      case 'mep-mv':
        this.crudDb.AddSuiviMepPR(insert_suivi).then(res => {
          console.log("::::SUIVI MV ADDED::");
          this.isAddSvMv = false;
          this.indexRowMepMv = null;
          this.updated_Suivi = <Update_FormModal_Suivi_Mep_Bloc>{};
          this.indexRowMepMvInfo = null;
          this.loadMep();
          console.log(":::Updated_Suivi::::", this.updated_Suivi);
        });
        break;
      default:
        console.log("default");
        break;
    }
  }
  onCancelEditSuivi(data: any) {
    //
    switch(data) {
      case 'mep-sg':
        this.isEditSvSg = false;
        this.indexRowMepSvSg = null;
        this.indexRowMepSg = null;
        this.updated_Suivi = <Update_FormModal_Suivi_Mep_Bloc>{};
        this.indexRowMepSgInfo = null;
        break;
      case 'mep-pa':
        this.isEditSvPa = false;
        this.indexRowMepSvPa = null;
        this.indexRowMepPa = null;
        this.updated_Suivi = <Update_FormModal_Suivi_Mep_Bloc>{};
        this.indexRowMepPaInfo = null;
        break;
      case 'mep-mv':
        this.isEditSvMv = false;
        this.indexRowMepSvMv = null;
        this.indexRowMepMv = null;
        this.updated_Suivi = <Update_FormModal_Suivi_Mep_Bloc>{};
        this.indexRowMepMvInfo = null;
        break;
      default:
        console.log("default");
        break;
    }
  }
  onSaveEditSuivi(data: any) {
    //{src: 'mep-sg', row_suivi: row}
    let elem_suivi: Loc_Suivi_MepPR = data.row_suivi;
    let updated_suivi: UpdateSuiviMepPR = {
      code_sv: elem_suivi.code_sv,
      id_culture: elem_suivi.id_culture,
      ddp: this.updated_Suivi.ddp,
      stc: this.updated_Suivi.stc != null?this.updated_Suivi.stc.value:null,
      ql: this.updated_Suivi.ql,
      qr: this.updated_Suivi.qr,
      long_ligne: this.updated_Suivi.long_ligne,
      nbre_ligne: this.updated_Suivi.nbre_ligne,
      nbre_pied: this.updated_Suivi.nbre_pied,
      hauteur: this.updated_Suivi.hauteur,
      ec: this.updated_Suivi.ec != null?this.updated_Suivi.ec.value:null,
      img_cult: this.updated_Suivi.img_culture,
      dt_capture: null,
      ex: this.updated_Suivi.estimation,
      dt_creation: elem_suivi.dt_creation,
      dt_modification: moment().format('YYYY-MM-DD'),
      etat: elem_suivi.etat_suivi === SYNC?SYNC:UPDATE
    }
    let data_to_up = {
      isUpdateSuivi: true,
      data_suivi: updated_suivi
    }
    console.log(":::DATA TO UPDATE:::", data_to_up);
    switch(data.src) {
      case 'mep-sg':
        this.crudDb.UpdateSuiviMepPR(data_to_up).then(res => {
          console.log(":::DATA SG UPDATED:::");
          this.isEditSvSg = false;
          this.indexRowMepSvSg = null;
          this.indexRowMepSg = null;
          this.updated_Suivi = <Update_FormModal_Suivi_Mep_Bloc>{};
          this.indexRowMepSgInfo = null;
          this.loadMep();
        });
        break;
      case 'mep-pa':
        this.crudDb.UpdateSuiviMepPR(data_to_up).then(res => {
          console.log(":::DATA SG UPDATED:::");
          this.isEditSvPa = false;
          this.indexRowMepSvPa = null;
          this.indexRowMepPa = null;
          this.updated_Suivi = <Update_FormModal_Suivi_Mep_Bloc>{};
          this.indexRowMepPaInfo = null;
          this.loadMep();
        });
        break;
      case 'mep-mv':
        this.crudDb.UpdateSuiviMepPR(data_to_up).then(res => {
          console.log(":::DATA SG UPDATED:::");
          this.isEditSvMv = false;
          this.indexRowMepSvMv = null;
          this.indexRowMepMv = null;
          this.updated_Suivi = <Update_FormModal_Suivi_Mep_Bloc>{};
          this.indexRowMepMvInfo = null;
          this.loadMep();
        });
        break;
      default:
        console.log("default");
        break;
    }
  }

  // load Data
  loadMep() {
    let data = {
      code_projet: this.projet.code_proj,
      code_equipe: this.user[this.user.length - 1].id_equipe
    }
    let data_suivi_mep: Loc_Suivi_MepPR[] = [];
    this.data_mep_pr = [];
    this.mep_mv = [];
    this.mep_sg = [];
    this.mep_pa = [];

    this.data_mep_info_sg = [];
    this.data_mep_info_pa = [];
    this.data_mep_info_mv = []; 
    this.loadAnneeAgricole();
    this.loadData.loadSuiviMepPR(data).then(res_suivi => {
      console.log("::::Data suivi Mep::::", res_suivi);
      if (res_suivi.values.length > 0) {
        res_suivi.values.forEach((elem_suivi: Loc_Suivi_MepPR) => {
          STC.forEach(elem_stc => {
            if(elem_stc.value === elem_suivi.stc) {
              elem_suivi.stc_intitule = elem_stc.intitule;
            }
           });
          EC_CULTURAL.forEach(elem_ec => {
            if (elem_ec.value === elem_suivi.ec) {
              elem_suivi.ec_intitule = elem_ec.intitule
            }
          });

          data_suivi_mep.push(elem_suivi);
        });
      }
    });
    this.loadData.loadMepPR(data).then(res_mep => {
      console.log(":::Data Mep::::", res_mep);
      if (res_mep.values.length > 0) {
        res_mep.values.forEach(elem_mep => {
          this.data_mep_pr.push(elem_mep);
        });
        // filter datasource MEP
        if (this.data_mep_pr.length > 0) {
          this.data_mep_pr.forEach(item_mep => {
            if (data_suivi_mep.length > 0) {
              item_mep.suivi_Mep = data_suivi_mep.filter(item_suivi => {return item_suivi.id_culture === item_mep.code_culture});
            } else item_mep.suivi_Mep = [];
          });
          this.mep_sg = this.data_mep_pr.filter(item_sg => {return item_sg.type.toLowerCase() === SG});
          this.mep_pa = this.data_mep_pr.filter(item_pa => {return item_pa.type.toLowerCase() === PA});
          this.mep_mv = this.data_mep_pr.filter(item_mv => {return item_mv.type.toLowerCase() === MV});
        }

        if (this.mep_sg.length > 0) {
          this.mep_sg.forEach(elem_mep_sg => {
             let verif_mep_info = this.data_mep_info_sg.filter(item_mep_info_sg => {return item_mep_info_sg.id_parce === elem_mep_sg.code_parce && item_mep_info_sg.id_annee === elem_mep_sg.id_annee});
             let verif_annee = this.data_annee_filter.filter(item_annee_filter => {return item_annee_filter.code === elem_mep_sg.id_annee});

             if (verif_annee.length === 0) {
              let annee_filter = this.data_annee_agricole.filter(item_annee => {return item_annee.code ===  elem_mep_sg.id_annee});
              this.data_annee_filter.push(annee_filter[0]);
             }
             if (verif_mep_info.length === 0) {
              this.data_mep_info_sg.push({
                id_parce: elem_mep_sg.code_parce,
                code_parce_temp: elem_mep_sg.code_parce_temp,
                lat: elem_mep_sg.lat,
                log: elem_mep_sg.log,
                sfce: elem_mep_sg.sfce_reel,
                code_pr: elem_mep_sg.code_pr,
                code_achat: elem_mep_sg.code_achat,
                img_benef: elem_mep_sg.img_benef,
                nom: elem_mep_sg.nom,
                prenom: elem_mep_sg.prenom,
                dt_nais: elem_mep_sg.date_naissance,
                cin: elem_mep_sg.cin,
                id_annee: elem_mep_sg.id_annee,
                annee_du: elem_mep_sg.annee_du,
                annee_au: elem_mep_sg.annee_au,
                mep: [],
                isExpanded: false,
                code_pr_temp: elem_mep_sg.code_pr_temp
              });
             }
          });
          this.data_mep_info_sg.forEach(elem_info_sg => {
            elem_info_sg.mep = this.mep_sg.filter(item_mep_sg => {return item_mep_sg.id_parce === elem_info_sg.id_parce && item_mep_sg.id_annee === elem_info_sg.id_annee});
          });
          // Export
          this.loadExportSg(this.mep_sg);
        }
        if (this.mep_pa.length >  0) {
          this.mep_pa.forEach(elem_mep_pa => {
            let verif_mep_info_pa = this.data_mep_info_pa.filter(item_info_pa => {return item_info_pa.id_parce === elem_mep_pa.code_parce && item_info_pa.id_annee === elem_mep_pa.id_annee});
            let verif_annee = this.data_annee_filter.filter(item_annee_filter => {return item_annee_filter.code === elem_mep_pa.id_annee});

             if (verif_annee.length === 0) {
              let annee_filter = this.data_annee_agricole.filter(item_annee => {return item_annee.code === elem_mep_pa.id_annee});
              this.data_annee_filter.push(annee_filter[0]);
             }
            if (verif_mep_info_pa.length === 0) {
              this.data_mep_info_pa.push({
                id_parce: elem_mep_pa.code_parce,
                code_parce_temp: elem_mep_pa.code_parce_temp,
                lat: elem_mep_pa.lat,
                log: elem_mep_pa.log,
                sfce: elem_mep_pa.sfce_reel,
                code_pr: elem_mep_pa.code_pr,
                code_achat: elem_mep_pa.code_achat,
                img_benef: elem_mep_pa.img_benef,
                nom: elem_mep_pa.nom,
                prenom: elem_mep_pa.prenom,
                dt_nais: elem_mep_pa.date_naissance,
                cin: elem_mep_pa.cin,
                id_annee: elem_mep_pa.id_annee,
                annee_du: elem_mep_pa.annee_du,
                annee_au: elem_mep_pa.annee_au,
                mep: [],
                isExpanded: false,
                code_pr_temp: elem_mep_pa.code_pr_temp
              });
            }
          });
          this.data_mep_info_pa.forEach(elem_info_pa => {
            elem_info_pa.mep = this.mep_pa.filter(item_mep_pa => {return item_mep_pa.code_parce === elem_info_pa.id_parce && item_mep_pa.id_annee === elem_info_pa.id_annee});
          });
          // Export
          this.loadExportPa(this.mep_pa);
        }

        if (this.mep_mv.length > 0) {
          this.mep_mv.forEach(elem_mep_mv => {
            let verif_mep_info_mv = this.data_mep_info_mv.filter(item_mep_info_mv => {return item_mep_info_mv.id_parce === elem_mep_mv.id_parce && item_mep_info_mv.id_annee === elem_mep_mv.id_annee});
            let verif_annee = this.data_annee_filter.filter(item_annee_filter => {return item_annee_filter.code === elem_mep_mv.id_annee});

             if (verif_annee.length === 0) {
              let annee_filter = this.data_annee_agricole.filter(item_annee => {return item_annee.code ===  elem_mep_mv.id_annee});
              this.data_annee_filter.push(annee_filter[0]);
             }
            if (verif_mep_info_mv.length === 0) {
              this.data_mep_info_mv.push({
                id_parce: elem_mep_mv.id_parce,
                code_parce_temp: elem_mep_mv.code_parce_temp,
                lat: elem_mep_mv.lat,
                log: elem_mep_mv.log,
                sfce: elem_mep_mv.sfce_reel,
                code_pr: elem_mep_mv.code_pr,
                code_achat: elem_mep_mv.code_achat,
                img_benef: elem_mep_mv.img_benef,
                nom: elem_mep_mv.nom,
                prenom: elem_mep_mv.prenom,
                dt_nais: elem_mep_mv.date_naissance,
                cin: elem_mep_mv.cin,
                id_annee: elem_mep_mv.id_annee,
                annee_du: elem_mep_mv.annee_du,
                annee_au: elem_mep_mv.annee_au,
                mep: [],
                isExpanded: false,
                code_pr_temp: elem_mep_mv.code_pr_temp
              });
            }
          });
          this.data_mep_info_mv.forEach(elem_mep_info_mv => {
            elem_mep_info_mv.mep = this.mep_mv.filter(item_mep_mv => {return item_mep_mv.id_annee === elem_mep_info_mv.id_annee && item_mep_mv.id_parce === elem_mep_info_mv.id_parce});
          });
          // Export
          this.loadExportMv(this.mep_mv);
        }

        this.dataSourceMepMvInfo.data = this.data_mep_info_mv;
        this.dataSourceMepSgInfo.data = this.data_mep_info_sg;
        this.dataSourceMepPaInfo.data = this.data_mep_info_pa;
        

      }
      console.log("::::data SG:::", this.dataSourceMepSgInfo);
      console.log("::::data PA:::", this.dataSourceMepPaInfo);
      console.log("::::data MV:::", this.dataSourceMepMvInfo);
    });
  }

  // load Data initiale
  loadDataInitial() {
    this.loadData.loadSaison().then(res_saison => {
      console.log(res_saison);
      if (res_saison.values.length > 0) {
        res_saison.values.forEach(elem_s => {
          this.data_saison.push(elem_s);
        });
      }
    });
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
  // load Data initial
  loadPRBloc() {
    let data = {
      code_projet: this.projet.code_proj,
      id_tech: this.user[this.user.length - 1].id_equipe
    }

    this.loadData.loadPRParceBloc(data).then(res => {
      this.data_parce = res.values;
      console.log("Parcelle PR::::", this.data_parce);
    });
    this.loadData.loadPRBloc(data).then(res => {
      this.data_pr = res.values;
      console.log("PR::::", this.data_pr);
    });
  }
  /********************************
   * LOAD EXPORT
   ********************************/
  loadExportSg(data_export_sg: Loc_MepPR[]) {
    this.mep_export_sg = [];
    this.suivi_export_sg = [];
    data_export_sg.forEach(elem_sg => {
      let export_suivi_sg: Loc_Suivi_MepPR[] = elem_sg.suivi_Mep;
      this.mep_export_sg.push({
        'Annee': elem_sg.annee_du + '-' + elem_sg.annee_au,
        'Code PR' : elem_sg.code_pr_temp,
        'Code Achat': elem_sg.code_achat,
        'Nom': elem_sg.prenom != null?elem_sg.nom.concat(' ', elem_sg.prenom):elem_sg.nom,
        'Dt Naissance': elem_sg.dt_nais != null?moment(elem_sg.dt_nais).format("DD/MM/YYYY"):elem_sg.dt_nais_vers,
        'Sexe': elem_sg.sexe,
        'CIN': elem_sg.cin,
        'Code Parce': elem_sg.code_parce_temp,
        'Lat': elem_sg.lat,
        'Log': elem_sg.log,
        'Sfce(m²)': elem_sg.sfce_reel,
        'Code MEP': elem_sg.code_culture_temp,
        'DDP': elem_sg.ddp != null?moment(elem_sg.ddp).format("DD/MM/YYYY"):elem_sg.ddp,
        'Variété': elem_sg.variette,
        'QSO': elem_sg.qso,
        'Unité': elem_sg.unite_espece,
        'DDS': elem_sg.dds != null?moment(elem_sg.dds).format("DD/MM/YYYY"):elem_sg.dds,
        'SC': elem_sg.sc,
        'Sfc_Emb(m²)': elem_sg.sfce_emb,
        'Nb Lignes': elem_sg.nbre_ligne,
        'Long lignes(m)': elem_sg.long_ligne
      });

      if (export_suivi_sg.length > 0) {
        export_suivi_sg.forEach(elem_suivi => {
          let stc_intitule: string;
          let ec_intitule: string;

          STC.forEach(elem_stc => {
            if(elem_stc.value === elem_suivi.stc) {
              stc_intitule = elem_stc.intitule;
            }
           });
          EC_CULTURAL.forEach(elem_ec => {
            if (elem_ec.value === elem_suivi.ec) {
              ec_intitule = elem_ec.intitule
            }
          });

          this.suivi_export_sg.push({
            'Annee': elem_sg.annee_du + '-' + elem_sg.annee_au,
            'Code MEP': elem_sg.code_culture_temp,
            'Code_Parce': elem_sg.code_parce_temp,
            'lat': elem_sg.lat,
            'log': elem_sg.log,
            'Sfce Reel(m²)': elem_sg.sfce_reel,
            'Sfc_Emb(m²)': elem_sg.sfce_emb,
            'Code_PR': elem_sg.code_pr_temp,
            'Nom': elem_sg.prenom != null?elem_sg.nom + ' ' + elem_sg.prenom:elem_sg.nom,
            'Dt Naissance': elem_sg.dt_nais != null?moment(elem_sg.dt_nais).format("DD/MM/YYYY"):elem_sg.dt_nais_vers,
            'Sexe': elem_sg.sexe,
            'CIN': elem_sg.cin,
            'Variété': elem_sg.variette,
            'DDS': elem_sg.dds != null?moment(elem_sg.dds).format("DD/MM/YYYY"):elem_sg.dds,
            'DDP': elem_suivi.ddp != null?moment(elem_suivi.ddp).format("DD/MM/YYYY"):elem_suivi.ddp,
            'STC': stc_intitule,
            'EC': ec_intitule,
            'Long ligne(m)': elem_suivi.long_ligne,
            'Nbr Ligne': elem_suivi.nbre_ligne,
            'Estimation': elem_suivi.ex,
            'Unité Estimation': elem_sg.unite_estimation
          })
        });
      }

    });
  }
  loadExportPa(data_export_pa: Loc_MepPR[]) {
    this.mep_export_pa = [];
    this.suivi_export_pa = [];
    data_export_pa.forEach(elem_pa => {
      let export_suivi_pa: Loc_Suivi_MepPR[] = elem_pa.suivi_Mep;
      this.mep_export_pa.push({
        'Annee': elem_pa.annee_du + '-' + elem_pa.annee_au,
        'Code PR' : elem_pa.code_pr_temp,
        'Code Achat': elem_pa.code_achat,
        'Nom': elem_pa.prenom != null?elem_pa.nom + ' ' + elem_pa.prenom:elem_pa.nom,
        'Dt Naissance': elem_pa.dt_nais != null?moment(elem_pa.dt_nais).format("DD/MM/YYYY"):elem_pa.dt_nais_vers,
        'Sexe': elem_pa.sexe,
        'CIN': elem_pa.cin,
        'Code Parce': elem_pa.code_parce_temp,
        'Lat': elem_pa.lat,
        'Log': elem_pa.log,
        'Sfce(m²)': elem_pa.sfce_reel,
        'Code MEP': elem_pa.code_culture_temp,
        'DDP': elem_pa.ddp != null?moment(elem_pa.ddp).format("DD/MM/YYYY"):elem_pa.ddp,
        'Espece': elem_pa.variette,
        'QSO': elem_pa.qso,
        'Unité': elem_pa.unite_espece,
        'DDS': elem_pa.dds != null?moment(elem_pa.dds).format("DD/MM/YYYY"):elem_pa.dds,
        'SC': elem_pa.sc,
        'Sfc_Emb(m²)': elem_pa.sfce_emb,
        'Nb Lignes': elem_pa.nbre_ligne,
        'Long lignes(m)': elem_pa.long_ligne
      });

      if (export_suivi_pa.length > 0) {
        export_suivi_pa.forEach(elem_suivi => {

          let ec_intitule: string;
          EC_CULTURAL.forEach(elem_ec => {
            if (elem_ec.value === elem_suivi.ec) {
              ec_intitule = elem_ec.intitule
            } 
          });

          this.suivi_export_pa.push({
            'Annee': elem_pa.annee_du + '-' + elem_pa.annee_au,
            'Code MEP': elem_pa.code_culture_temp,
            'Code_Parce': elem_pa.code_parce_temp,
            'lat': elem_pa.lat,
            'log': elem_pa.log,
            'Sfce Reel(m²)': elem_pa.sfce_reel,
            'Code_PR': elem_pa.code_pr_temp,
            'Nom': elem_pa.prenom != null?elem_pa.nom + ' ' + elem_pa.prenom:elem_pa.nom,
            'Dt Naissance': elem_pa.dt_nais != null?moment(elem_pa.dt_nais).format("DD/MM/YYYY"):elem_pa.dt_nais_vers,
            'Sexe': elem_pa.sexe,
            'CIN': elem_pa.cin,
            'Espece': elem_pa.variette,
            'DDS': elem_pa.dds != null?moment(elem_pa.dds).format("DD/MM/YYYY"):elem_pa.dds,
            'DDP': elem_suivi.ddp != null?moment(elem_suivi.ddp).format("DD/MM/YYYY"):elem_suivi.ddp,
            'QL': elem_suivi.ql,
            'QR': elem_suivi.qr,
            'EC': ec_intitule,
            'Nbr_Ligne': elem_suivi.nbre_ligne,
            'Long_ligne(m)': elem_suivi.long_ligne,
            'Hauteur': elem_suivi.hauteur
          })
        });
      }

    });
  }
  loadExportMv(data_export_mv: Loc_MepPR[]) {                                          
    this.mep_export_mv = [];
    this.suivi_export_mv = [];
    data_export_mv.forEach(elem_mv => {
      let export_suivi_mv: Loc_Suivi_MepPR[] = elem_mv.suivi_Mep;
      this.mep_export_mv.push({
        'Annee': elem_mv.annee_du + '-' + elem_mv.annee_au,
        'Code PR' : elem_mv.code_pr_temp,
        'Code Achat': elem_mv.code_achat,
        'Nom': elem_mv.prenom != null?elem_mv.nom + ' ' + elem_mv.prenom:elem_mv.nom,
        'Dt Naissance': elem_mv.dt_nais != null?moment(elem_mv.dt_nais).format("DD/MM/YYYY"):elem_mv.dt_nais_vers,
        'Sexe': elem_mv.sexe,
        'CIN': elem_mv.cin,
        'Code Parce': elem_mv.code_parce_temp,
        'Lat': elem_mv.lat,
        'Log': elem_mv.log,
        'Sfce(m²)': elem_mv.sfce_reel,
        'Code MEP': elem_mv.code_culture_temp,
        'DDP': elem_mv.ddp != null?moment(elem_mv.ddp).format("DD/MM/YYYY"):elem_mv.ddp,
        'Espece': elem_mv.variette,
        'QSO': elem_mv.qso,
        'Unité': elem_mv.unite_espece,
        'DDS': elem_mv.dds != null?moment(elem_mv.dds).format("DD/MM/YYYY"):elem_mv.dds,
        'Sfc_Emb(m²)': elem_mv.sfce_emb,
        'SC': elem_mv.sc,
        'Nb_Ligne': elem_mv.nbre_ligne,
        'Long_ligne(m)': elem_mv.long_ligne
      });

      if (export_suivi_mv.length > 0) {
        export_suivi_mv.forEach(elem_suivi => {
          this.suivi_export_mv.push({
            'Année': elem_mv.annee_du + '-' + elem_mv.annee_au,
            'Code MEP': elem_mv.code_culture_temp,
            'Code_Parce': elem_mv.code_parce_temp,
            'lat': elem_mv.lat,
            'log': elem_mv.log,
            'Sfce Reel(m²)': elem_mv.sfce_reel,
            'Code_PR': elem_mv.code_pr_temp,
            'Nom': elem_mv.prenom != null?elem_mv.nom + ' ' + elem_mv.prenom:elem_mv.nom,
            'Sexe': elem_mv.sexe,
            'Dt Naissance': elem_mv.dt_nais != null?moment(elem_mv.dt_nais).format("DD/MM/YYYY"):elem_mv.dt_nais_vers,
            'CIN': elem_mv.cin,
            'Espece': elem_mv.variette,
            'DDS': elem_mv.dds != null?moment(elem_mv.dds).format("DD/MM/YYYY"):elem_mv.dds,
            'DDP': elem_suivi.ddp != null?moment(elem_suivi.ddp):elem_suivi.ddp,
            'Nbr Pieds': elem_suivi.nbre_pied,
            'Nbr Ligne': elem_suivi.nbre_ligne,
            'Long ligne(m)': elem_suivi.long_ligne,
            'Estimation': elem_suivi.ex,
            'Unité Estimation': elem_mv.unite_estimation
          });
        });
      }
    });
  }
  // init PC
  initUpdatedMep() {
    this.updated_Mep = <Update_Mep>{}
  }
  //
  generateCodeMep() {
    let code_mep: string = '';
    let annee_ = this.updated_Mep.annee != null?this.updated_Mep.annee.annee_du.toString().charAt(2) + this.updated_Mep.annee.annee_du.toString().charAt(3) + this.updated_Mep.annee.annee_au.toString().charAt(2) + this.updated_Mep.annee.annee_au.toString().charAt(3):null;

    if (this.updated_Mep.saison != null) {
      //return code_mep = annee_ + this.updated_Mep.saison.intitule + '-' + this.user[this.user.length - 1].id_equipe +  this.projet.ancronyme + '-' + 'Mep';
      return code_mep = annee_ + this.updated_Mep.saison.intitule + '-' + this.user[this.user.length - 1].id_equipe + '-' + 'Mep';  
    } else {
      return code_mep =  annee_ + '-' + this.user[this.user.length - 1].id_equipe + 'Mep'; 
    }
  }

  // modal
  async onPresentModal(data: any) {
    let data_: any;
    if (data.action === 'add') {
      /**{
        src: 'mep-sg',
        action: 'add',
        isNewParce: parent.isNewParce,
        data_initial: data,
        element_info: null,
        index_info: null
      }*/
      if (data.src === 'mep-sg') {
        data_ = {
          isSuiviPR: true,
          isAddMepSg: true,
          data_init: data.data_initial,
          element_info: null
        }
        if (!data.isNewParce) {
          data_.element_info = data.element_info;
        }
      } else if (data.src === 'mep-pa') {
        data_ = {
          isSuiviPR: true,
          isAddMepPa: true,
          data_init: data.data_initial,
          element_info: null
        }
        if (!data.isNewParce) {
          data_.element_info = data.element_info;
        }
      } else if (data.src === 'mep-mv') {
        data_ = {
          isSuiviPR: true,
          isAddMepMv: true,
          data_init: data.data_initial,
          element_info: null
        }
        if (!data.isNewParce) {
          data_.element_info = data.element_info;
        }
      }
    } else if (data.action === 'edit') {
      //let data_ = {src: 'add', data: element, index: i};
      if (data.src === 'mep-sg') {
        data_ = {
          isSuiviPR: true,
          isEditMepSg: true,
          element: data.row,
          data_init: data.data_initial
        }
      } else if (data.src === 'mep-pa') {
        data_ = {
          isSuiviPR: true,
          isEditMepPa: true,
          element: data.row,
          data_init: data.data_initial
        }
      } else if (data.src === 'mep-mv') {
        data_ = {
          isSuiviPR: true,
          isEditMepMv: true,
          element: data.row,
          data_init: data.data_initial
        }
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
        console.log("::::DATA MODAL:::", data_modal.data);
        this.updated_Mep = data_modal.data;
        this.updated_Mep.ddp = data_modal.data.ddp.format("YYYY-MM-DD");
        this.updated_Mep.dds = data_modal.data.dds.format("YYYY-MM-DD");
        this.updated_Mep.dt_distribution = data_modal.data.dt_distribution != null?data_modal.data.dt_distribution.format("YYYY-MM-DD"):null;
        //this.updated_Mep.autreCultureEa = data_modal.data.autreCultureEa != null?data_modal.data.autreCultureEa:data_modal.data.espece_ea != null?data_modal.data.espece_ea.nom_espece:null
        
        if (data.action === 'add') {
          if (data.src === 'mep-sg') {
            if (data.isNewParce)  {
              this.onSaveMep('mep-sg');
            } else {
              this.indexRowMepSgInfo = data.index_info;
              this.isAddSg = true;
            }
          } else if (data.src === 'mep-pa') {
            if (data.isNewParce)  {
              this.onSaveMep('mep-pa');
            } else {
              this.indexRowMepPaInfo = data.index_info;
              this.isAddPa = true;
            }
          } else if (data.src === 'mep-mv') {
            if (data.isNewParce)  {
              this.onSaveMep('mep-mv');
            } else {
              this.indexRowMepMvInfo = data.index_info;
              this.isAddMv = true;
            }
          }
        } else if (data.action === 'edit') {
          //let data_ = {src: 'add', data: element, index: i};
          //{src: 'mep-mv', action: 'edit', row: element, index_info: ind_info_mep, index: i, data_initial: null}
          if (data.src === 'mep-sg') {
            this.indexRowMepSgInfo = data.index_info;
            this.indexRowMepSg = data.index;
            this.isEditRowSg = true;
          } else if (data.src === 'mep-pa') {
            this.indexRowMepPaInfo = data.index_info;
            this.indexRowMepPa = data.index;
            this.isEditRowPa = true;
          } else if (data.src === 'mep-mv') {
            this.indexRowMepMvInfo = data.index_info;
            this.indexRowMepMv = data.index;
            this.isEditRowMv = true;
          }
        }
      }
    });
    await modal.present();
  }
  // modal updated suivi
  async onPresentMadalSuivi(data: any) {
    let data_: any;
    if (data.action === 'add') {
      if (data.src === 'mep-sg') {
        data_ = {
          isSuiviSvPR: true,
          isAddSvSg: true,
          data_mep: data.row_mep,
          espece: this.data_espece,
          variette: this.data_var
        }
      } else if (data.src === 'mep-pa') {
        data_ = {
          isSuiviSvPR: true,
          isAddSvPa: true,
          data_mep: data.row_mep,
          espece: this.data_espece,
          variette: this.data_var
        }
      } else if (data.src === 'mep-mv') {
        data_ = {
          isSuiviSvPR: true,
          isAddSvMv: true,
          data_mep: data.row_mep,
          espece: this.data_espece,
          variette: this.data_var
        }
      }
    } else if (data.action === 'edit') {
      //let data_ = {src: 'add', data: element, index: i};
      if (data.src === 'mep-sg') {
        data_ = {
          isSuiviSvPR: true,
          isEditSvSg: true,
          data_mep: data.row_mep,
          data_elem_suivi: data.row_suivi,
          espece: this.data_espece,
          variette: this.data_var
        }
      } else if (data.src === 'mep-pa') {
        data_ = {
          isSuiviSvPR: true,
          isEditSvPa: true,
          data_mep: data.row_mep,
          data_elem_suivi: data.row_suivi,
          espece: this.data_espece,
          variette: this.data_var
        }
      } else if (data.src === 'mep-mv') {
        data_ = {
          isSuiviSvPR: true,
          isEditSvMv: true,
          data_mep: data.row_mep,
          data_elem_suivi: data.row_suivi,
          espece: this.data_espece,
          variette: this.data_var
        }
      }
    }
    let modal = await this.modalCtrl.create({
      component: ModalPrPage,
      cssClass: 'modal-custum-pr',
      backdropDismiss: true,
      componentProps: data_
    });
    modal.onDidDismiss().then(modal_data => {
      console.log("::::Data modal Suivi::", modal_data.data);
      if (modal_data.data != undefined) {
        let elem_mep: Loc_MepPR = data.row_mep;

        this.updated_Suivi = modal_data.data;
        this.updated_Suivi.ddp = modal_data.data.ddp.format("YYYY-MM-DD");
        this.updated_Suivi.unite_estimation = elem_mep.unite_estimation;
        if (data.action === 'add') {
          switch(data.src) {
            case 'mep-sg':
              this.isAddSvSg = true;
              this.indexRowMepSg = data.index_mep;
              this.indexRowMepSgInfo =  data.index_info;
              break;
            case 'mep-pa':
              this.isAddSvPa = true;
              this.indexRowMepPa = data.index_mep;
              this.indexRowMepPaInfo =  data.index_info;
              break;
            case 'mep-mv':
              this.isAddSvMv = true;
              this.indexRowMepMv = data.index_mep;
              this.indexRowMepMvInfo =  data.index_info;
              break;
            default:
              console.log("default");
              break;
          }
        } else if (data.action === 'edit') {
          //let data_ = {src: 'add', data: element, index: i};
          switch(data.src) {
            case 'mep-sg':
              this.isEditSvSg = true;
              this.indexRowMepSgInfo =  data.index_info;
              this.indexRowMepSg = data.index_mep;
              this.indexRowMepSvSg = data.index_mep_suivi;
              break;
            case 'mep-pa':
              this.isEditSvPa = true;
              this.indexRowMepPaInfo =  data.index_info;
              this.indexRowMepPa = data.index_mep;
              this.indexRowMepSvPa = data.index_mep_suivi;
              break;
            case 'mep-mv':
              this.isEditSvMv = true;
              this.indexRowMepMvInfo =  data.index_info;
              this.indexRowMepMv = data.index_mep;
              this.indexRowMepSvMv = data.index_mep_suivi;
              break;
            default:
              console.log("default");
              break;
          }
        }
      }
    });
    await modal.present();
  }

  // Toggel Rows
  onToggleTableRows(src:any) {
    switch(src.src) {
      case 'mep-sg':
        this.isTableSgExpanded = !this.isTableSgExpanded;
        this.dataSourceMepSgInfo.data.forEach((row: Loc_MepPr_info) => {
          if (row.mep.length > 0) {
            row.isExpanded = this.isTableSgExpanded;
          } else {
            if (row.isExpanded) {
              row.isExpanded = false;
            }
          }
        });
        break;
      case 'mep-pa':
        this.isTablePaExpanded = !this.isTablePaExpanded;
        this.dataSourceMepPaInfo.data.forEach((row: Loc_MepPr_info) => {
          if (row.mep.length > 0) {
            row.isExpanded = this.isTablePaExpanded;
          } else {
            if (row.isExpanded) {
              row.isExpanded = false;
            }
          }
        });
        break;
      case 'mep-mv':
        this.isTableMvExpanded = !this.isTableMvExpanded;
        this.dataSourceMepMvInfo.data.forEach((row: Loc_MepPr_info) => {
          if (row.mep.length > 0) {
            row.isExpanded = this.isTableMvExpanded;
          } else {
            if (row.isExpanded) {
              row.isExpanded = false;
            }
          }
        });
        break
    }
  }
  //
  onClick() {
    this.router.navigate(['homes']);
  }
  // 
  loadAnneeAgricole() {
    this.loadData.loadAnneeAgricole().then(res => {
      this.data_annee_agricole = res.values;
    });
  }
}
        
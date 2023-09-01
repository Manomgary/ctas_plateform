import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Directory, Filesystem } from '@capacitor/filesystem';
// Import
import { IonAccordionGroup, LoadingController, ModalController, Platform } from '@ionic/angular';
import * as _moment from 'moment';
import { AddMepBloc, UpdateSuiviBloc } from 'src/app/interfaces/interface-insertDb';
import { Find_suivi_mep_bloc, Local_benef_activ_bl, Local_bloc_parce, Local_bloc_zone, Loc_all_suivi_bloc, Loc_all_suivi_mep, Loc_AnneeAgricole, Loc_Bloc, Loc_categEspece, Loc_Commune, Loc_Espece, Loc_export_excel, Loc_mep_bloc, Loc_mep_info_bloc, Loc_saison, Loc_suivi_mep, Loc_sv_bloc, Loc_variette, Update_FormModal_Suivi_Mep_Bloc } from 'src/app/interfaces/interfaces-local';
import { CrudDbService } from 'src/app/services/local/crud-db.service';
import { LoadDataService } from 'src/app/services/local/load-data.service';
import { ACTIVE, EC, EC_CULTURAL, IMAGE_DIR, MV, PA, SC, SG, STC, SYNC, UPDATE } from 'src/app/utils/global-variables';
import { Utilisateurs } from 'src/app/utils/interface-bd';
import { ModalBlocPage } from '../../modals/modal-bloc/modal-bloc.page';

// import excelle
import { animate, state, style, transition, trigger } from '@angular/animations';
import { ModalPrPage } from '../../modals/modal-pr/modal-pr.page';
import { ExportExcelService } from 'src/app/services/export-excel.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from 'src/app/component/dialog/dialog.component';

const moment = _moment;

interface update_Mep_form {
  annee: Loc_AnneeAgricole,
  saison: Loc_saison,
  bloc: Loc_Bloc,
  beneficiaire: Local_benef_activ_bl,
  parcelle: Local_bloc_parce,
  ddp: string,
  qso: number,
  dt_distribution: string,
  dds: string,
  sfce: number,
  nbre_ligne: number,
  long_ligne: number,
  usage: string,
  sc: any,
  categorie_ea: Loc_categEspece,
  espece: Loc_Espece,
  espece_ea: Loc_Espece,
  variette: Loc_variette,
  variette_ea: Loc_variette,
  autreCultureEa: string
}

@Component({
  selector: 'app-suivi-bloc',
  templateUrl: './suivi-bloc.page.html',
  styleUrls: ['./suivi-bloc.page.scss'],
  animations: [ //utiliser pour @detailExpand (table expendable)
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ])
  ]
})
export class SuiviBlocPage implements OnInit {
  // Aliment data source
  private src_MepSg: Loc_mep_bloc[] = [];
  private src_MepPa: Loc_mep_bloc[] = [];
  private src_MepMv: Loc_mep_bloc[] = [];
  private data_Mep: Loc_mep_bloc[] = [];
  private updated_Suivi: Update_FormModal_Suivi_Mep_Bloc = <Update_FormModal_Suivi_Mep_Bloc>{};

  private data_all_suivi_mep: Loc_all_suivi_bloc[] = [];
  private src_AllSvSg: Loc_all_suivi_bloc[] = [];
  private src_AllSvMv: Loc_all_suivi_bloc[] = [];
  private src_AllSvPa: Loc_all_suivi_bloc[] = [];

  
  // Displayed column
  private displayedColumnsInfoMepSg: string[] = ['annee', 'bloc', 'code_benef', 'nom_benef', 'code_parce', 'latitude', 'longitude', 'sfce_reel', 'action'];
  private displayedColumnsMepSg: string[] = ['annee', 'saison', 'code_mep', 'ddp', 'variette', 'qso', 'dds', 'sfce_embl', 'sc', 'ea', 'nbre_ligne', 'long_ligne', 'action'];
  private displayedColumnsAddMepSg: string[] = ['new_annee', 'new_saison', 'new_code_mep', 'new_ddp', 'new_variette', 'new_qso', 'new_dds', 'new_sfce_embl', 'new_sc', 'new_ea', 'new_nbre_ligne', 'new_long_ligne', 'new_action'];
  private displayedColumnsSuiviSg: string[] = ['ddp', 'stc', 'ec', 'long_ligne', 'nbre_ligne', 'img_cult', 'estimation', 'action'];
  private displayedColumnsAddSuiviSg: string[] = ['new_ddp', 'new_stc', 'new_ec', 'new_long_ligne', 'new_nbre_ligne', 'new_img_cult', 'new_estimation', 'new_action'];
  //
  private displayedColumnsInfoMepPa: string[] = ['annee', 'bloc', 'code_benef', 'nom_benef', 'code_parce', 'latitude', 'longitude', 'sfce_reel', 'action'];
  private displayedColumnsMepPa: string[] = ['annee', 'code_mep', 'ddp', 'espece', 'qo', 'dt_dist', 'dt_mep', 'nbre_ligne', 'long_ligne', 'action'];
  private displayedColumnsAddMepPa: string[] = ['new_annee', 'new_code_mep', 'new_ddp', 'new_espece', 'new_qo', 'new_dt_dist', 'new_dt_mep', 'new_nbre_ligne', 'new_long_ligne', 'new_action'];
  private displayedColumnsSuiviPa: string[] = ['ddp', 'ql', 'ec', 'nbre_ligne', 'hauteur', 'img_cult', 'qr', 'action'];
  private displayedColumnsAddSuiviPa: string[] = ['new_ddp', 'new_ql', 'new_ec', 'new_nbre_ligne', 'new_hauteur', 'new_img_cult', 'new_qr', 'new_action'];

  private displayedColumnsInfoMepMv: string[] = ['annee', 'bloc', 'code_benef', 'nom_benef', 'code_parce', 'latitude', 'longitude', 'sfce_reel', 'action'];
  private displayedColumnsMepMv: string[] = ['annee', 'code_mep', 'saison', 'ddp', 'espece', 'qso', 'dt_mep', 'sfce_embl', 'nbre_ligne', 'long_ligne', 'sc', 'ea', 'action'];
  private displayedColumnsAddMepMv: string[] = ['new_annee', 'new_code_mep', 'new_saison', 'new_ddp', 'new_espece', 'new_qso', 'new_dt_mep', 'new_sfce_embl', 'new_nbre_ligne', 'new_long_ligne', 'new_sc', 'new_ea', 'new_action'];
  private displayedColumnsSuiviMv: string[] = ['ddp', 'nbre_pieds', 'long_ligne', 'nbre_ligne', 'estimation', 'action'];
  private displayedColumnsAddSuiviMv: string[] = ['new_ddp', 'new_nbre_pieds', 'new_long_ligne', 'new_nbre_ligne', 'new_estimation', 'new_action'];
  
  private displayedColumnsAllSvSg: string[] = ['code_suivi', 'bloc', 'parcelle', 'code_benef', 'nom', 'variette', 'qso', 'dds', 'sfce_emb', 'sc', 'ddp', 'stc', 'ec', 'long_ligne', 'nbre_ligne', 'img_cult', 'ex'];
  private displayedColumnsAllSvMv: string[] = ['code_suivi', 'bloc', 'parcelle', 'code_benef', 'nom', 'ddp', 'espece', 'qso', 'dds', 'sfce_emb', 'sc', 'nbre_pied', 'long_ligne', 'nbre_ligne', 'ex'];
  private displayedColumnsAllSvPa: string[] = ['code_suivi', 'bloc', 'parcelle', 'code_benef', 'nom', 'ddp', 'espece', 'qso', 'dds', 'sfce_emb', 'ql', 'ec', 'nbre_ligne', 'hauteur', 'img_cult', 'qr'];
  

  /***************************
   * Data Source
   ***************************/
  private dataSourceMepSg = new MatTableDataSource<Loc_mep_bloc>();
  private dataSourceInfoMepSg = new MatTableDataSource<Loc_mep_info_bloc>();

  private dataSourceMepPa = new MatTableDataSource<Loc_mep_bloc>();
  private dataSourceInfoMepPa = new MatTableDataSource<Loc_mep_info_bloc>();

  private dataSourceMepMv = new MatTableDataSource<Loc_mep_bloc>();
  private dataSourceInfoMepMv = new MatTableDataSource<Loc_mep_info_bloc>();

  private dataSourceAllSuiviSg= new MatTableDataSource<Loc_all_suivi_bloc>();
  private dataSourceAllSuiviMv= new MatTableDataSource<Loc_all_suivi_bloc>();
  private dataSourceAllSuiviPa= new MatTableDataSource<Loc_all_suivi_bloc>();

  /**********************
   * boolean button
   ********************/ 
  isUpdated: boolean = false;

  // row Mep Edit
  isRowMepSgEdit: boolean = false;
  isRowMepPaEdit: boolean = false;
  isRowMepMvEdit: boolean = false;
  // row Mep Add
  isAddMepSg: boolean = false;
  isAddMepPa: boolean = false;
  isAddMepMv: boolean = false;
  // row suivi Edit
  isRowSvSgEdit: boolean = false;
  isRowSvPaEdit: boolean = false;
  isRowSvMvEdit: boolean = false;
  // New Element Suivi
  isAddSuiviSg: boolean = false;
  isAddSuiviPa: boolean = false;
  isAddSuiviMv: boolean = false;
  // expanded btn
  isTableSgExpanded = false;
  isTablePaExpanded = false;
  isTableMvExpanded = false;

  // Index
  indexSg: number;
  indexPa: number;
  indexMv: number;

  // index Edit mep
  indexRowEditMepSg: number;
  indexRowEditMepPa: number;
  indexRowEditMepMv: number;
  
  // index info mep
  indexRowInfoMepSg: number;
  indexRowInfoMepPa: number;
  indexRowInfoMepMv: number;


  /*********************************
   * Autre
   **********************************/
   region: any;
   district: any;
   projet: any;
   user: Utilisateurs[];
   data_bloc_parce: Local_bloc_parce[] = [];
   data_bloc: Loc_Bloc[] = [];
   data_benef: Local_benef_activ_bl[] = [];
   data_saison: Loc_saison[]  = [];
   data_espece: Loc_Espece[] = [];
   data_var: Loc_variette[] = [];
   data_categ: Loc_categEspece[] = [];
   data_annee_agricole: Loc_AnneeAgricole[] = [];
   

   data_sc: any[] = SC;
   data_stc: any[] = STC;
   data_ec: any[] = EC_CULTURAL;

   update_mep: update_Mep_form = <update_Mep_form>{};

  // Export
  mep_export_sg: any[] = [];
  mep_export_pa: any[] = [];
  mep_export_mv: any[] = [];
  // Export sv
  sv_export_sg: any[] = [];
  sv_export_pa: any[] = [];
  sv_export_mv: any[] = [];
  //Selected filtre;
  selected_bloc: Loc_Bloc;
  selectedAnnee: Loc_AnneeAgricole;

  mep_info_sg: Loc_mep_info_bloc[] = [];
  mep_info_pa: Loc_mep_info_bloc[] = [];
  mep_info_mv: Loc_mep_info_bloc[] = [];

  data_annee_bloc_filter: Loc_AnneeAgricole[] = [];

  etat_sync = SYNC;
  
  @ViewChild(IonAccordionGroup, { static: true }) accordionGroup: IonAccordionGroup;

  constructor(
    private modalCtrl: ModalController,
    private loadData: LoadDataService,
    private router: Router,
    private crudDb: CrudDbService,
    private loadingCtrl: LoadingController,
    private exportExcel: ExportExcelService,
    private dialog: MatDialog
  ) {
    if (this.router.getCurrentNavigation().extras.state) {
      let data: any;
      const routeState = this.router.getCurrentNavigation().extras.state;
      console.log(routeState);
      data = JSON.parse(routeState.zone);
      this.projet = JSON.parse(routeState.projet);
      this.user = JSON.parse(routeState.user);
      this.region = data.data.region;
      this.district = data.data.district;
      console.log("Suivi bloc: data router zone::::", data);
      this.loadBlocZone();
      this.loadDataInitial();
    }
   }

  ngOnInit() {}
  ionViewDidEnter() {
    console.log(":::::LifeCycle Suivi bLOC function:::: ionViewDidEnter:::");
  }
  /************************************
   * Load Data
   *************************************/
  /**loadCommuneBloc() {

    let commune: Loc_Commune[] = [];
    let code_equipe: number;
    let id_dist = {
      code_dist: this.district.code_dist
    };
    this.loadData.loadCommune(id_dist).then(res_com => {
      console.log(res_com);
      if (res_com.values.length > 0) {
        res_com.values.forEach((elem_com, ind) => {
          code_equipe = this.user[this.user.length - 1].id_equipe;
          console.log("Code equipe::", code_equipe);
          // load Bloc BY ZONE BY EQUIPE
          const data = {
            code_com: elem_com.code_com,
            code_projet: this.projet.code_proj,
            id_tech: code_equipe
          }
          this.loadData.loadBlocEquipeZone(data).then(res_bloc => {
            if (res_bloc.values.length > 0) {
              res_bloc.values.forEach((elem_bloc, ind_bloc) => {
                this.data_bloc.push(elem_bloc);
              });
            } else {
              console.log("Bloc non identifié!!!!!, commune :::", elem_com.nom_com);
            }
            if((res_com.values.length - 1) === ind) {
              console.log(":::::FIN du BOUCLE COMMUNE Data bloc::::" , this.data_bloc);
              this.loadBeneficiaire();
              this.loadMepBloc();
            }
          });
        });
      }
    });
  }*/
  loadBlocZone(){ 
    this.data_bloc = [];

    const data = {
      code_dist: this.district.code_dist,
      code_projet: this.projet.code_proj,
      id_tech: this.user[this.user.length - 1].id_equipe
    }
    this.loadData.loadBlocEquipeZone(data).then(res_bloc => {

      if (res_bloc.values.length > 0) {
        res_bloc.values.forEach(elem_bloc => {
          this.data_bloc.push(elem_bloc);
        });
        // load benef
        this.loadBeneficiaire();
        this.loadMepBloc();
      }
    });
  }
  
  // load Saison
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
  // load Beneficiaire
  loadBeneficiaire() {
    if (this.data_bloc.length > 0) {
      this.data_bloc.forEach(elem_bloc => {
        let code_bloc = {
          code_bloc: elem_bloc.code_bloc
        }
        this.loadData.loadBenefBloc(elem_bloc.code_bloc).then(res_benef => {
          console.log(res_benef);
          res_benef.values.forEach((elem_benef: Local_benef_activ_bl) => {
            let verif_benef = this.data_benef.filter(item_verif => {return item_verif.code_benef_bl === elem_benef.code_benef_bl});
            if (verif_benef.length === 0) {
              this.data_benef.push(elem_benef);
            }
          });
        });
        this.loadData.loadBlocParce(code_bloc).then(parce_bloc => {
          console.log(parce_bloc);
          if (parce_bloc.values.length > 0) {
            parce_bloc.values.forEach(elem_parce => {
              console.log(elem_parce);
              this.data_bloc_parce.push(elem_parce);
            });
          }
        });
      });
    }
  }
  // load Mep Bloc
  loadMepBloc() {
    if (this.data_bloc.length > 0) {
      this.data_Mep = [];
      this.data_all_suivi_mep = [];
      
      this.data_bloc.forEach((elem_bloc, ind) => {
        let data = {
          id_bloc: elem_bloc.code_bloc
        }
        // loadAll suivi
        this.loadData.loadAllSuiviBloc({id_bloc: elem_bloc.code_bloc}).then(res_suivi => {
          console.log("Response All suivi Bloc::::", res_suivi);
          if (res_suivi.values.length > 0) {
            res_suivi.values.forEach((elem_suivi, index) => {
              
              EC_CULTURAL.forEach(elem_ec => {
                if (elem_ec.value === elem_suivi.ec) {
                  elem_suivi.ec_intitule = elem_ec.intitule;
                }
              });
              STC.forEach(elem_stc => {
                if (elem_stc.value === elem_suivi.stc) {
                  elem_suivi.stc_intitule = elem_stc.intitule;
                }
              });
              this.data_all_suivi_mep.push(elem_suivi);
            });
          }
        });
        this.loadData.loadMepBloc(data).then(res_mep => {
          console.log("Response load Mep Bloc:::", res_mep);
          if (res_mep.values.length > 0) {
            res_mep.values.forEach(elem_mep => {
              this.data_Mep.push(elem_mep);
              /**this.data_Mep.forEach(item_mep => {
                item_mep.suivi_Mep = [];
              });*/
            });
            console.log("data_mep::::: ", this.data_Mep);
          }
            // fin du boucle
          if ((this.data_bloc.length - 1) === ind) {
            console.log("::::Data Mep With element:::", this.data_Mep);
            this.refreshDataSource();
            this.loadAnneeAgricole();
          }
        });
      });
    }
  }
  // load All Suivi Bloc
  loadAllSuiviBloc() {

    if (this.data_bloc.length > 0) {

      this.data_all_suivi_mep = [];

      this.data_bloc.forEach(elem_bloc => {
        this.loadData.loadAllSuiviBloc({id_bloc: elem_bloc.code_bloc}).then(res_suivi => {
          console.log("Response All suivi Bloc::::", res_suivi);
          if (res_suivi.values.length > 0) {
            res_suivi.values.forEach((elem_suivi, index) => {
              this.data_all_suivi_mep.push(elem_suivi);
            });
            // filter data
            this.src_AllSvSg = this.data_all_suivi_mep.filter(item => {return item.type === SG});
            this.src_AllSvMv = this.data_all_suivi_mep.filter(item => {return item.type === MV});
            this.src_AllSvPa = this.data_all_suivi_mep.filter(item => {return item.type === PA});
          }
        });
      });

      setTimeout(() => {
        // refresh data source
        this.dataSourceAllSuiviSg.data = this.src_AllSvSg;
        this.dataSourceAllSuiviMv.data = this.src_AllSvMv;
        this.dataSourceAllSuiviPa.data = this.src_AllSvPa;

        // load Export
        this.loadDataExportSvSg(this.src_AllSvSg);
        this.loadDataExportSvMv(this.src_AllSvMv);
        this.loadDataExportSvPa(this.src_AllSvPa);
        
        this.loadingCtrl.dismiss();
      }, 1000);
    }
  }

  /********************
   * Filtre bouton
   ********************/
  applyFilterSelect(data: any, src: string) {
  if (data != undefined) {
    switch(src) {
      case 'bloc':
        this.data_annee_bloc_filter = [];
        let select_bl: Loc_Bloc = data;
        let filter_bl = select_bl.code_bloc;

        let data_suivi_sg: Loc_all_suivi_bloc[] = [];
        let data_suivi_pa: Loc_all_suivi_bloc[] = [];
        let data_suivi_mv: Loc_all_suivi_bloc[] = [];

        let export_mepSg = this.src_MepSg.filter(item_prc => {return item_prc.code_bloc === filter_bl});
        let export_mepPa = this.src_MepPa.filter(item_prc => {return item_prc.code_bloc === filter_bl});
        let export_mepMv = this.src_MepMv.filter(item_prc => {return item_prc.code_bloc === filter_bl});

        // 
        if (export_mepSg.length > 0) {
          export_mepSg.forEach((elem_expSg, ind_expSg) => {
            // Elem MEP
            if (elem_expSg.suivi_Mep.length > 0) {
              elem_expSg.suivi_Mep.forEach((elem_suivi, ind_suivi) => {
                data_suivi_sg.push(elem_suivi);
                // Fin du boucle suivi
                if ((elem_expSg.suivi_Mep.length - 1) === ind_suivi) {
                  // Fin du boucle Export MEP
                  if ((export_mepSg.length - 1) === ind_expSg) {
                    //
                    this.loadDataExportSvSg(data_suivi_sg);
                  }
                }
              });
            } else {
              // Fin du boucle Export MEP
              if ((export_mepSg.length - 1) === ind_expSg) {
                this.loadDataExportSvSg(data_suivi_sg);
              }
            }
          });
        }
        // PA
        if (export_mepPa.length > 0) {
          export_mepPa.forEach((elem_expPa, ind_expPa) => {
            // Elem MEP
            if (elem_expPa.suivi_Mep.length > 0) {
              elem_expPa.suivi_Mep.forEach((elem_suivi, ind_suivi) => {
                data_suivi_pa.push(elem_suivi);
                // Fin du boucle suivi
                if ((elem_expPa.suivi_Mep.length - 1) === ind_suivi) {
                  // Fin du boucle Export MEP
                  if ((export_mepPa.length - 1) === ind_expPa) {
                    this.loadDataExportSvPa(data_suivi_pa);
                  }
                }
              });
            } else {
              // Fin du boucle Export MEP
              if ((export_mepPa.length - 1) === ind_expPa) {
                this.loadDataExportSvPa(data_suivi_pa);
              }
            }
          });
        }
        // MV
        if (export_mepMv.length > 0) {
          export_mepMv.forEach((elem_expmV, ind_expmV) => {
            // Elem MEP
            if (elem_expmV.suivi_Mep.length > 0) {
              elem_expmV.suivi_Mep.forEach((elem_suivi, ind_suivi) => {
                data_suivi_mv.push(elem_suivi);
                // Fin du boucle suivi
                if ((elem_expmV.suivi_Mep.length - 1) === ind_suivi) {
                  // Fin du boucle Export MEP
                  if ((export_mepMv.length - 1) === ind_expmV) {
                    this.loadDataExportSvMv(data_suivi_mv);
                  }
                }
              });
            } else {
              // Fin du boucle Export MEP
              if ((export_mepMv.length - 1) === ind_expmV) {
                this.loadDataExportSvMv(data_suivi_mv);
              }
            }
          });
        }
        this.loadDataExportSg(export_mepSg);
        this.loadDataExportPa(export_mepPa);
        this.loadDataExportMv(export_mepMv);

        let filtre_mep_info_sg = this.mep_info_sg.filter(item_info_sg => {return item_info_sg.code_bloc === filter_bl});
        let filtre_mep_info_pa = this.mep_info_pa.filter(item_info_sg => {return item_info_sg.code_bloc === filter_bl});
        let filtre_mep_info_mv = this.mep_info_mv.filter(item_info_sg => {return item_info_sg.code_bloc === filter_bl});

        filtre_mep_info_sg.forEach(elem_info_sg => {
          let verif_annee = this.data_annee_bloc_filter.filter(item_annee => {return item_annee.code === elem_info_sg.id_annee});
          if(verif_annee.length === 0) {
            let annee_ = this.data_annee_agricole.filter(item => {return item.code === elem_info_sg.id_annee});
            if (annee_.length > 0) {
              this.data_annee_bloc_filter.push(annee_[0]);
            }
          }
        });
        filtre_mep_info_pa.forEach(elem_info_pa => {
          let verif_annee = this.data_annee_bloc_filter.filter(item_annee => {return item_annee.code === elem_info_pa.id_annee});
          if(verif_annee.length === 0) {
            let annee_ = this.data_annee_agricole.filter(item => {return item.code === elem_info_pa.id_annee});
            if (annee_.length > 0) {
              this.data_annee_bloc_filter.push(annee_[0]);
            }
          }
        });
        filtre_mep_info_mv.forEach(elem_info_mv => {
          let verif_annee = this.data_annee_bloc_filter.filter(item_annee => {return item_annee.code === elem_info_mv.id_annee});
          if(verif_annee.length === 0) {
            let annee_ = this.data_annee_agricole.filter(item => {return item.code === elem_info_mv.id_annee});
            if (annee_.length > 0) {
              this.data_annee_bloc_filter.push(annee_[0]);
            }
          }
        });

        this.dataSourceInfoMepSg.data = filtre_mep_info_sg;
        this.dataSourceInfoMepPa.data = filtre_mep_info_pa;
        this.dataSourceInfoMepMv.data = filtre_mep_info_mv;

        /**this.dataSourceInfoMepSg.filter = filter_bl.trim();
        this.dataSourceInfoMepPa.filter = filter_bl.trim();
        this.dataSourceInfoMepMv.filter = filter_bl.trim();*/
        break;
      case 'annee':
        let select_annee: Loc_AnneeAgricole = data;
        let filter_annee = select_annee.code;

        let data_suivi_sg_annee: Loc_all_suivi_bloc[] = [];
        let data_suivi_pa_annee: Loc_all_suivi_bloc[] = [];
        let data_suivi_mv_annee: Loc_all_suivi_bloc[] = [];

        let export_mepSg_annee = this.src_MepSg.filter(item_mep_sg => {return item_mep_sg.code_bloc === this.selected_bloc.code_bloc && item_mep_sg.id_annee === filter_annee});
        let export_mepPa_annee = this.src_MepPa.filter(item_mep_pa => {return item_mep_pa.code_bloc === this.selected_bloc.code_bloc && item_mep_pa.id_annee === filter_annee});
        let export_mepMv_annee = this.src_MepMv.filter(item_mep_mv => {return item_mep_mv.code_bloc === this.selected_bloc.code_bloc && item_mep_mv.id_annee === filter_annee});

        // 
        if (export_mepSg_annee.length > 0) {
          export_mepSg_annee.forEach((elem_expSg, ind_expSg) => {
            // Elem MEP
            if (elem_expSg.suivi_Mep.length > 0) {
              elem_expSg.suivi_Mep.forEach((elem_suivi, ind_suivi) => {
                data_suivi_sg_annee.push(elem_suivi);
                // Fin du boucle suivi
                if ((elem_expSg.suivi_Mep.length - 1) === ind_suivi) {
                  // Fin du boucle Export MEP
                  if ((export_mepSg_annee.length - 1) === ind_expSg) {
                    this.loadDataExportSvSg(data_suivi_sg_annee);
                  }
                }
              });
            } else {
              // Fin du boucle Export MEP
              if ((export_mepSg_annee.length - 1) === ind_expSg) {
                this.loadDataExportSvSg(data_suivi_sg_annee);
              }
            }
          });
        }
        // PA
        if (export_mepPa_annee.length > 0) {
          export_mepPa_annee.forEach((elem_expPa, ind_expPa) => {
            // Elem MEP
            if (elem_expPa.suivi_Mep.length > 0) {
              elem_expPa.suivi_Mep.forEach((elem_suivi, ind_suivi) => {
                data_suivi_pa_annee.push(elem_suivi);
                // Fin du boucle suivi
                if ((elem_expPa.suivi_Mep.length - 1) === ind_suivi) {
                  // Fin du boucle Export MEP
                  if ((export_mepPa_annee.length - 1) === ind_expPa) {
                    this.loadDataExportSvPa(data_suivi_pa_annee);
                  }
                }
              });
            } else {
              // Fin du boucle Export MEP
              if ((export_mepPa_annee.length - 1) === ind_expPa) {
                this.loadDataExportSvPa(data_suivi_pa_annee);
              }
            }
          });
        }
        // MV
        if (export_mepMv_annee.length > 0) {
          export_mepMv_annee.forEach((elem_expmV, ind_expmV) => {
            // Elem MEP
            if (elem_expmV.suivi_Mep.length > 0) {
              elem_expmV.suivi_Mep.forEach((elem_suivi, ind_suivi) => {
                data_suivi_mv_annee.push(elem_suivi);
                // Fin du boucle suivi
                if ((elem_expmV.suivi_Mep.length - 1) === ind_suivi) {
                  // Fin du boucle Export MEP
                  if ((export_mepMv_annee.length - 1) === ind_expmV) {
                    this.loadDataExportSvMv(data_suivi_mv_annee);
                  }
                }
              });
            } else {
              // Fin du boucle Export MEP
              if ((export_mepMv_annee.length - 1) === ind_expmV) {
                this.loadDataExportSvMv(data_suivi_mv_annee);
              }
            }
          });
        }

        this.loadDataExportSg(export_mepSg_annee);
        this.loadDataExportPa(export_mepPa_annee);
        this.loadDataExportMv(export_mepMv_annee);

        let filtre_mep_info_sg_annee = this.mep_info_sg.filter(item_info_sg => {return item_info_sg.code_bloc === this.selected_bloc.code_bloc && item_info_sg.id_annee === filter_annee});
        let filtre_mep_info_pa_annee = this.mep_info_pa.filter(item_info_pa => {return item_info_pa.code_bloc === this.selected_bloc.code_bloc && item_info_pa.id_annee === filter_annee});
        let filtre_mep_info_mv_annee = this.mep_info_mv.filter(item_info_mv => {return item_info_mv.code_bloc === this.selected_bloc.code_bloc && item_info_mv.id_annee === filter_annee});
        
        this.dataSourceInfoMepSg.data = filtre_mep_info_sg_annee;
        this.dataSourceInfoMepPa.data = filtre_mep_info_pa_annee;
        this.dataSourceInfoMepMv.data = filtre_mep_info_mv_annee;
        break;
      case 'beneficiaire':
        let select_benef: any = data;
        break;
    }
  }
  }
  applyFilterTout(table: string) {

    switch(table) {
      case 'bloc':
        this.data_annee_bloc_filter = [];

        let data_suivi_sg: Loc_all_suivi_bloc[] = [];
        let data_suivi_pa: Loc_all_suivi_bloc[] = [];
        let data_suivi_mv: Loc_all_suivi_bloc[] = [];

        // 
        if (this.src_MepSg.length > 0) {
          this.src_MepSg.forEach((elem_expSg, ind_expSg) => {
            // Elem MEP
            if (elem_expSg.suivi_Mep.length > 0) {
              elem_expSg.suivi_Mep.forEach((elem_suivi, ind_suivi) => {
                data_suivi_sg.push(elem_suivi);
                // Fin du boucle suivi
                if ((elem_expSg.suivi_Mep.length - 1) === ind_suivi) {
                  // Fin du boucle Export MEP
                  if ((this.src_MepSg.length - 1) === ind_expSg) {
                    //
                    this.loadDataExportSvSg(data_suivi_sg);
                  }
                }
              });
            } else {
              // Fin du boucle Export MEP
              if ((this.src_MepSg.length - 1) === ind_expSg) {
                this.loadDataExportSvSg(data_suivi_sg);
              }
            }
          });
        }
        // PA
        if (this.src_MepPa.length > 0) {
          this.src_MepPa.forEach((elem_expPa, ind_expPa) => {
            // Elem MEP
            if (elem_expPa.suivi_Mep.length > 0) {
              elem_expPa.suivi_Mep.forEach((elem_suivi, ind_suivi) => {
                data_suivi_pa.push(elem_suivi);
                // Fin du boucle suivi
                if ((elem_expPa.suivi_Mep.length - 1) === ind_suivi) {
                  // Fin du boucle Export MEP
                  if ((this.src_MepPa.length - 1) === ind_expPa) {
                    this.loadDataExportSvPa(data_suivi_pa);
                  }
                }
              });
            } else {
              // Fin du boucle Export MEP
              if ((this.src_MepPa.length - 1) === ind_expPa) {
                this.loadDataExportSvPa(data_suivi_pa);
              }
            }
          });
        }
        // MV
        if (this.src_MepMv.length > 0) {
          this.src_MepMv.forEach((elem_expmV, ind_expmV) => {
            // Elem MEP
            if (elem_expmV.suivi_Mep.length > 0) {
              elem_expmV.suivi_Mep.forEach((elem_suivi, ind_suivi) => {
                data_suivi_mv.push(elem_suivi);
                // Fin du boucle suivi
                if ((elem_expmV.suivi_Mep.length - 1) === ind_suivi) {
                  // Fin du boucle Export MEP
                  if ((this.src_MepMv.length - 1) === ind_expmV) {
                    this.loadDataExportSvMv(data_suivi_mv);
                  }
                }
              });
            } else {
              // Fin du boucle Export MEP
              if ((this.src_MepMv.length - 1) === ind_expmV) {
                this.loadDataExportSvMv(data_suivi_mv);
              }
            }
          });
        }

        this.loadDataExportSg(this.src_MepSg);
        this.loadDataExportPa(this.src_MepPa);
        this.loadDataExportMv(this.src_MepMv);
  
        this.dataSourceInfoMepSg.data = this.mep_info_sg;
        this.dataSourceInfoMepPa.data = this.mep_info_pa;
        this.dataSourceInfoMepMv.data = this.mep_info_mv;

        this.selected_bloc = <Loc_Bloc>{};
        this.selectedAnnee = <Loc_AnneeAgricole>{};
        break;
      case 'annee':
        let export_mepSg_annee = this.src_MepSg.filter(item_mep_sg => {return item_mep_sg.code_bloc === this.selected_bloc.code_bloc});
        let export_mepPa_annee = this.src_MepPa.filter(item_mep_pa => {return item_mep_pa.code_bloc === this.selected_bloc.code_bloc});
        let export_mepMv_annee = this.src_MepMv.filter(item_mep_mv => {return item_mep_mv.code_bloc === this.selected_bloc.code_bloc});

        let data_suivi_sg_annee: Loc_all_suivi_bloc[] = [];
        let data_suivi_pa_annee: Loc_all_suivi_bloc[] = [];
        let data_suivi_mv_annee: Loc_all_suivi_bloc[] = [];

        // 
        if (export_mepSg_annee.length > 0) {
          export_mepSg_annee.forEach((elem_expSg, ind_expSg) => {
            // Elem MEP
            if (elem_expSg.suivi_Mep.length > 0) {
              elem_expSg.suivi_Mep.forEach((elem_suivi, ind_suivi) => {
                data_suivi_sg_annee.push(elem_suivi);
                // Fin du boucle suivi
                if ((elem_expSg.suivi_Mep.length - 1) === ind_suivi) {
                  // Fin du boucle Export MEP
                  if ((export_mepSg_annee.length - 1) === ind_expSg) {
                    this.loadDataExportSvSg(data_suivi_sg_annee);
                  }
                }
              });
            } else {
              // Fin du boucle Export MEP
              if ((export_mepSg_annee.length - 1) === ind_expSg) {
                this.loadDataExportSvSg(data_suivi_sg_annee);
              }
            }
          });
        }
        // PA
        if (export_mepPa_annee.length > 0) {
          export_mepPa_annee.forEach((elem_expPa, ind_expPa) => {
            // Elem MEP
            if (elem_expPa.suivi_Mep.length > 0) {
              elem_expPa.suivi_Mep.forEach((elem_suivi, ind_suivi) => {
                data_suivi_pa_annee.push(elem_suivi);
                // Fin du boucle suivi
                if ((elem_expPa.suivi_Mep.length - 1) === ind_suivi) {
                  // Fin du boucle Export MEP
                  if ((export_mepPa_annee.length - 1) === ind_expPa) {
                    this.loadDataExportSvPa(data_suivi_pa_annee);
                  }
                }
              });
            } else {
              // Fin du boucle Export MEP
              if ((export_mepPa_annee.length - 1) === ind_expPa) {
                this.loadDataExportSvPa(data_suivi_pa_annee);
              }
            }
          });
        }
        // MV
        if (export_mepMv_annee.length > 0) {
          export_mepMv_annee.forEach((elem_expmV, ind_expmV) => {
            // Elem MEP
            if (elem_expmV.suivi_Mep.length > 0) {
              elem_expmV.suivi_Mep.forEach((elem_suivi, ind_suivi) => {
                data_suivi_mv_annee.push(elem_suivi);
                // Fin du boucle suivi
                if ((elem_expmV.suivi_Mep.length - 1) === ind_suivi) {
                  // Fin du boucle Export MEP
                  if ((export_mepMv_annee.length - 1) === ind_expmV) {
                    this.loadDataExportSvMv(data_suivi_mv_annee);
                  }
                }
              });
            } else {
              // Fin du boucle Export MEP
              if ((export_mepMv_annee.length - 1) === ind_expmV) {
                this.loadDataExportSvMv(data_suivi_mv_annee);
              }
            }
          });
        }

        this.loadDataExportSg(export_mepSg_annee);
        this.loadDataExportPa(export_mepPa_annee);
        this.loadDataExportMv(export_mepMv_annee);

        let filtre_mep_info_sg_annee = this.mep_info_sg.filter(item_info_sg => {return item_info_sg.code_bloc === this.selected_bloc.code_bloc});
        let filtre_mep_info_pa_annee = this.mep_info_pa.filter(item_info_pa => {return item_info_pa.code_bloc === this.selected_bloc.code_bloc});
        let filtre_mep_info_mv_annee = this.mep_info_mv.filter(item_info_mv => {return item_info_mv.code_bloc === this.selected_bloc.code_bloc});
        
        this.dataSourceInfoMepSg.data = filtre_mep_info_sg_annee;
        this.dataSourceInfoMepPa.data = filtre_mep_info_pa_annee;
        this.dataSourceInfoMepMv.data = filtre_mep_info_mv_annee;
        this.selectedAnnee = <Loc_AnneeAgricole>{};
        break;
    }
  }
  /*************************
   * Action btn
   **************************/
  onUpdate() {
    this.isUpdated = true;
  }
  // Add MEP
  onAdd(src) {
    //src: 'mep-sg', elem_info: element_info_mep, index_info: ind_info_mep
    console.log("*****Add Mep*******", src);
    const data = {
      src: src.src,
      data: {
        saison: this.data_saison,
        bloc: this.data_bloc,
        beneficiaire: this.data_benef,
        parcelle: this.data_bloc_parce,
        categorie: this.data_categ,
        espece: this.data_espece,
        variette: this.data_var,
        annee_agricole: this.data_annee_agricole,
        elem_info: src.elem_info
      },
      index_info: src.index_info
    }

    if (src.src === 'mep-sg') {
      this.presentModal(data);
    } else if (src.src === 'mep-pa') {
      this.presentModal(data);
    } else if (src.src === 'mep-mv') {
      this.presentModal(data);
    }
  }
  onAddNewMep(src) {
    //src: 'mep-sg', elem_info: element_info_mep, index_info: ind_info_mep
    console.log("*****Add Mep*******", src);
    const data = {
      src: src,
      data: {
        saison: this.data_saison,
        bloc: this.data_bloc,
        beneficiaire: this.data_benef,
        parcelle: this.data_bloc_parce,
        categorie: this.data_categ,
        espece: this.data_espece,
        variette: this.data_var,
        annee_agricole: this.data_annee_agricole
      }
    }

    if (src === 'mep-sg') {
      this.presentModal(data);
    } else if (src === 'mep-pa') {
      this.presentModal(data);
    } else if (src === 'mep-mv') {
      this.presentModal(data);
    }
  }

  onDeleteMepElement(element: any) {
    let elem_mep: Loc_mep_bloc = element;
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '500px',
      data: {
        elem_mep_bloc: elem_mep
      }
    });
    dialogRef.afterClosed().subscribe(async result => {
      if (result != undefined) {
        const loading = await this.loadingCtrl.create();
        await loading.present();
        if (elem_mep.etat_mep === SYNC) {
          let code_mep = {
            code_mep: elem_mep.code_culture
          }
          this.loadData.findSuiviMepBloc(elem_mep.code_culture).then(res_suivi => {
            let data_suivi: Find_suivi_mep_bloc[] = res_suivi.values;

            if (data_suivi.length > 0) {
              // delete suivi
              this.crudDb.deleteSuiviBloc(code_mep).then(res => {
                // delete MEP
                this.crudDb.deleteMepBloc(code_mep).then(res_del => {
                  this.loadMepBloc();
                  setTimeout(() => {
                    this.refreshDataSource();
                    this.loadingCtrl.dismiss();
                  }, 500);
                });  
              });
            } else {
              this.crudDb.deleteMepBloc(code_mep).then(res_del => {
                this.loadMepBloc();
                setTimeout(() => {
                  this.refreshDataSource();
                  this.loadingCtrl.dismiss();
                }, 500);
              });
            }
          });
        } else {
          this.loadingCtrl.dismiss();
        }
      }
    });
  }
  // Delte suivi MEP
  onDeleteSuiviElement(elem: any) {
    let elem_suivi: Loc_all_suivi_bloc = elem;
    let code_suivi = {
      code_suivi: elem_suivi.code_sv
    }
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '500px',
      data: {
        elem_suivi_bloc: elem_suivi
      }
    });
    dialogRef.afterClosed().subscribe(async result => {
      if (result != undefined) {
        const loading = await this.loadingCtrl.create();
        await loading.present();
        if (elem_suivi.etat_suivi === SYNC) {
          this.crudDb.deleteSuiviBloc(code_suivi).then(res_del => {
            // refresh
            this.loadMepBloc();
            setTimeout(() => {
              this.refreshDataSource();
              this.loadingCtrl.dismiss();
            }, 500);
          });
        } else {
          this.loadingCtrl.dismiss();
        }
      }
    });
  }

  onEditElem(data: any) {
    // Element
    //{data: row, src: 'mep-sg', index: i, index_info: ind_info_mep}
    console.log("Edit Element MEP", data.data);
    const data_ = {
      src: data.src,
      data_ : {
        saison: this.data_saison,
        bloc: this.data_bloc,
        beneficiaire: this.data_benef,
        parcelle: this.data_bloc_parce,
        categorie: this.data_categ,
        espece: this.data_espece,
        variette: this.data_var,
        data_row: data.data,
        annee_agricole: this.data_annee_agricole
      },
      index_info: data.index_info
    }
    switch(data.src) {
      case 'mep-sg':
        // load Data Suivi s
        this.indexRowEditMepSg = data.index;
        this.indexRowInfoMepSg = data.index_info;
        this.presentModalEdit(data_);
        break;
      case 'mep-pa':
        // load Data Mep PA
        this.indexRowEditMepPa  = data.index;
        this.indexRowInfoMepPa = data.index_info;
        this.presentModalEdit(data_);
        break;
      case 'mep-mv':
        //load Data Suivi MV
        this.indexRowEditMepMv = data.index;
        this.indexRowInfoMepMv = data.index_info;
        this.presentModalEdit(data_);
        break;
      default:
        console.log("default")
        break;
    }
  }
  // Save Add Mep
  async onSaveAddMep(source) {
    const loading = await this.loadingCtrl.create();
    await loading.present();
    let order = 1;
    let new_mep: AddMepBloc = {
      code_culture: this.generateCodeMep(),
      code_culture_temp: this.generateCodeMep(),
      id_parce: this.update_mep.parcelle != null ? this.update_mep.parcelle.code_parce : null,
      id_espece: this.update_mep.variette != null ? null : this.update_mep.espece.code_espece,
      id_var: this.update_mep.variette != null ? this.update_mep.variette.code_var : null,
      id_saison: this.update_mep.saison != null ? this.update_mep.saison.code_saison : null,
      id_annee: this.update_mep.annee != null ? this.update_mep.annee.code : null,
      ddp: this.update_mep.ddp,
      qso: this.update_mep.qso,
      dt_distribution: this.update_mep.dt_distribution,
      dds: this.update_mep.dds,
      sfce: this.update_mep.sfce,
      nbre_ligne: this.update_mep.nbre_ligne,
      long_ligne: this.update_mep.long_ligne,
      sc: this.update_mep.sc != null ? this.update_mep.sc.value : null,
      usage: this.update_mep.usage,
      ea_autres: this.update_mep.autreCultureEa,
      ea_id_variette: this.update_mep.variette_ea != null ? this.update_mep.variette_ea.code_var : null,
      dt_creation: moment().format("YYYY-MM-DD"),
      dt_modification: moment().format("YYYY-MM-DD"),
      status: EC,
      etat: SYNC,
      id_equipe: this.user[this.user.length - 1].id_equipe,
      type: null
    }
    switch(source) {
      case 'mep-sg':
        // insertion
        new_mep.type = SG;
        let data_sg = {
          type: SG, 
          id_bloc: this.update_mep.bloc != null?this.update_mep.bloc.code_bloc:null, 
          id_saison: this.update_mep.saison != null?this.update_mep.saison.code_saison:null, 
          annee_du: this.update_mep.annee != null?this.update_mep.annee.code:null
        }
        
        this.loadData.loadMepBloc(data_sg).then(res_mep => {
          let data_res_mep: Loc_mep_bloc[] = res_mep.values;
          // generer full code
          if (data_res_mep.length > 0) {
            data_res_mep.forEach((elem_mep, i) => {
              // Fin du boucle
              if ((data_res_mep.length - 1) === i)  {
                let last_id: string = elem_mep.code_culture_temp;
                let arr_lastId = last_id.trim().split("-");
                let num_code: string = '';
                order = parseInt(arr_lastId[arr_lastId.length - 1]) + 1;
                if (order < 100) {
                  if (order < 10) {
                    num_code = '00';
                  } else {
                    num_code = '0';
                  }
                }
                new_mep.code_culture_temp = this.generateCodeMep() + SG.toUpperCase() + '-' + num_code + order;
              }
            });
          } else {
            new_mep.code_culture_temp = this.generateCodeMep() + SG.toUpperCase() + '-' + '00' + order;
          }

          new_mep.code_culture = this.generateCodeMep() + SG.toUpperCase() + '-' + moment().format('YYMMDD:HHmmss');
          // Insert new mep
          this.crudDb.AddMepBl(new_mep).then(res => {
            console.log("Data Semences en grains To Add::: ", new_mep);
            // refresh dataSource
            
            this.loadMepBloc();
            setTimeout(() => {
              this.refreshDataSource();
              this.loadingCtrl.dismiss();
            }, 500);
            this.isAddMepSg = false;
            this.indexRowInfoMepSg = null;
            this.update_mep = <update_Mep_form>{};
          }, err => {
            this.loadingCtrl.dismiss();
          });
        });
        break;
      case 'mep-pa':
        // insertion
        console.log("New Data jeunes plants::: ", this.update_mep);
        let data_pa = {
          type: PA, 
          id_bloc: this.update_mep.bloc != null?this.update_mep.bloc.code_bloc:null, 
          annee_du: this.update_mep.annee != null?this.update_mep.annee.code:null
        }
        new_mep.type = PA;

        this.loadData.loadMepBloc(data_pa).then(res_mep => {
          let data_res_mep: Loc_mep_bloc[] = res_mep.values;
          // generate code
          if (data_res_mep.length > 0) {
            data_res_mep.forEach((elem_mep, i) => {
              // Fin du boucle
              if ((data_res_mep.length - 1) === i)  {
                let last_id: string = elem_mep.code_culture_temp;
                let arr_lastId = last_id.trim().split("-");
                let num_code: string = '';

                order = parseInt(arr_lastId[arr_lastId.length - 1]) + 1;
                if (order < 100) {
                  if (order < 10) {
                    num_code = '00';
                  } else {
                    num_code = '0';
                  }
                }
                // CODE Mep...
                new_mep.code_culture_temp = this.generateCodeMep() + PA.toUpperCase() + '-' + num_code + order;
              }
            });
          } else {
            new_mep.code_culture_temp = this.generateCodeMep() + PA.toUpperCase() + '-' + '00' + order;
          }
          new_mep.code_culture = this.generateCodeMep() + PA.toUpperCase() + '-' + moment().format('YYMMDD:HHmmss');
          // Insert new Mep PA
          this.crudDb.AddMepBl(new_mep).then(res => {
            console.log("Data jeunes plants To Add::: ", new_mep);
            // refresh data source
            this.loadMepBloc();
            setTimeout(() => {
              this.refreshDataSource();
              this.loadingCtrl.dismiss();
            }, 500);
            this.isAddMepPa = false;
            this.indexRowInfoMepPa = null;
            this.update_mep = <update_Mep_form>{};
          }, err => {
            this.loadingCtrl.dismiss();
          });

        });
        break;
      case 'mep-mv':
        // insertion
        console.log("New Data Materiels vegetaux::: ", this.update_mep);
        let data_mv: any;
        new_mep.type = MV;

        if (this.update_mep.saison != null) {
          data_mv = {
            type: MV, 
            id_bloc: this.update_mep.bloc != null?this.update_mep.bloc.code_bloc:null, 
            id_saison: this.update_mep.saison != null?this.update_mep.saison.code_saison:null, 
            annee_du: this.update_mep.annee != null?this.update_mep.annee.code:null
          }
        } else {
          data_mv = {
            type: MV, 
            id_bloc: this.update_mep.bloc != null?this.update_mep.bloc.code_bloc:null, 
            annee_du: this.update_mep.annee != null?this.update_mep.annee.code:null
          }
        }
        this.loadData.loadMepBloc(data_mv).then(res_mep => {
          let data_res_mep: Loc_mep_bloc[] = res_mep.values;
          // Generer code MV
          if (data_res_mep.length > 0) {
            data_res_mep.forEach((elem_mep, i) => {
              // Fin du boucle
              if ((data_res_mep.length - 1) === i)  {
                let last_id: string = elem_mep.code_culture_temp;
                let arr_lastId = last_id.trim().split("-");
                let num_code: string = '';

                order = parseInt(arr_lastId[arr_lastId.length - 1]) + 1;
                if (order < 100) {
                  if (order < 10) {
                    num_code = '00';
                  } else {
                    num_code = '0';
                  }
                }
                // CODE MEP
                new_mep.code_culture_temp = this.generateCodeMep() + MV.toUpperCase() + '-' + num_code + order;
              }
            });
          } else {
            new_mep.code_culture_temp = this.generateCodeMep() + MV.toUpperCase() + '-' + '00' + order;
          }

          new_mep.code_culture = this.generateCodeMep() + MV.toUpperCase() + '-' + moment().format('YYMMDD:HHmmss');
          // Insert new MEP MV
          this.crudDb.AddMepBl(new_mep).then(res => {
            console.log("Data Maeteriels vegetaux To Add::: ", new_mep);
            // refresh data source
            
            this.loadMepBloc();
            setTimeout(() => {
              this.refreshDataSource();
              this.loadingCtrl.dismiss();
            }, 500);
            this.isAddMepMv = false;
            this.indexRowInfoMepMv = null;
            this.update_mep = <update_Mep_form>{};
          }, err => {
            this.loadingCtrl.dismiss();
          });

        });
        break;
        default:
          this.loadingCtrl.dismiss();
          break;
    }
  }
  onCancelAddMep(source) {
    switch(source) {
      case 'mep-sg':
        this.isAddMepSg = false;
        this.indexRowInfoMepSg = null;
        this.update_mep = <update_Mep_form>{};
        break;
      case 'mep-pa':
        this.isAddMepPa = false;
        this.indexRowInfoMepPa = null;
        this.update_mep = <update_Mep_form>{};
        break;
      case 'mep-mv':
        this.isAddMepMv = false;
        this.indexRowInfoMepMv = null;
        this.update_mep = <update_Mep_form>{};
        break;
    }
  }
  // Save Edit Mep
  onClickSaveEdit(source: any) {
    let data_row: Loc_mep_bloc = source.data;
    let updated_mep_: AddMepBloc = {
      code_culture: data_row.code_culture,
      code_culture_temp: data_row.code_culture_temp,
      id_parce: this.update_mep.parcelle != null ? this.update_mep.parcelle.code_parce : null,
      id_espece: this.update_mep.variette != null ? null : this.update_mep.espece.code_espece,
      id_var: this.update_mep.variette != null ? this.update_mep.variette.code_var : null,
      id_saison: this.update_mep.saison != null ? this.update_mep.saison.code_saison : null,
      id_annee: this.update_mep.annee != null ? this.update_mep.annee.code : null,
      ddp: this.update_mep.ddp,
      qso: this.update_mep.qso,
      dt_distribution: this.update_mep.dt_distribution,
      dds: this.update_mep.dds,
      sfce: this.update_mep.sfce,
      nbre_ligne: this.update_mep.nbre_ligne,
      long_ligne: this.update_mep.long_ligne,
      usage: this.update_mep.usage,
      sc: this.update_mep.sc != null ? this.update_mep.sc.value : null,
      ea_autres: this.update_mep.autreCultureEa,
      ea_id_variette: this.update_mep.variette_ea != null ? this.update_mep.variette_ea.code_var : null,
      dt_creation: data_row.dt_creation,
      dt_modification: moment().format("YYYY-MM-DD"),
      status: EC,
      etat: data_row.etat_mep === SYNC ? SYNC : UPDATE,
      id_equipe: this.user[this.user.length - 1].id_equipe,
      type: data_row.type
    }
    console.log("Row Data Edit::::", source.data);
    console.log("Row Data Edit 2::::", data_row);
    this.crudDb.UpdateMepBl(updated_mep_).then(res => {
      console.log("Mep Updated:::", res.changes);
      this.loadMepBloc();
      setTimeout(() => {
        this.refreshDataSource();
        this.loadingCtrl.dismiss();
      }, 500);
    });
    switch(source.src) {
      case 'mep-sg':
        console.log("SAVE Data To Edit SG::::", updated_mep_);
        this.isRowMepSgEdit = false;
        this.indexRowEditMepSg = null;
        this.indexRowInfoMepSg = null;
        this.update_mep = <update_Mep_form>{};
        // Save Edit
        break;
      case 'mep-pa':
        console.log("SAVE Data To Edit PA::::", updated_mep_);
        this.isRowMepPaEdit = false;
        this.indexRowEditMepPa = null;
        this.indexRowInfoMepPa = null;
        this.update_mep = <update_Mep_form>{};
        // Save Edit
        break;
      case 'mep-mv':
        console.log("SAVE Data To Edit MV::::", updated_mep_);
        this.isRowMepMvEdit = false;
        this.indexRowEditMepMv = null;
        this.indexRowInfoMepMv = null;
        this.update_mep = <update_Mep_form>{};
        // Save Edit
        break;
      default:
        break;
    }
  }
  onClickCancelEdit(source: any) {
    switch(source) {
      case 'mep-sg':
        console.log("Cancel Edit SG::::",this.update_mep);
        this.isRowMepSgEdit = false;
        this.indexRowEditMepSg = null;
        this.indexRowInfoMepSg = null;
        this.update_mep = <update_Mep_form>{};
        break;
      case 'mep-pa':
        console.log("Cancel Edit PA::::", this.update_mep);
        this.isRowMepPaEdit = false;
        this.indexRowEditMepPa = null;
        this.indexRowInfoMepPa = null;
        this.update_mep = <update_Mep_form>{};
        // Save Edit
        break;
      case 'mep-mv':
        console.log("Cancel Edit MV::::", this.update_mep);
        this.isRowMepMvEdit = false;
        this.indexRowEditMepMv = null;
        this.indexRowInfoMepMv = null;
        this.update_mep = <update_Mep_form>{};
        // Save Edit
        break;
      default:
        break;
    }
  }
  // Save Add suivi
  onSaveAddSuivi(src: any) {
    // {src: 'sv-sg', row_mep: element_mep}
    let row_mep_selected: Loc_mep_bloc = src.row_mep;
    let add_suivi: UpdateSuiviBloc = {
      code_sv: row_mep_selected.code_culture + '_' + moment().format('YYMMDD:HHmmss'),
      id_culture: row_mep_selected.code_culture,
      ddp: this.updated_Suivi.ddp,
      stc: this.updated_Suivi.stc != null?this.updated_Suivi.stc.value:null,
      ec: this.updated_Suivi.ec != null?this.updated_Suivi.ec.value:null,
      ql: this.updated_Suivi.ql,
      qr: this.updated_Suivi.qr,
      long_ligne: this.updated_Suivi.long_ligne,
      nbre_ligne: this.updated_Suivi.nbre_ligne,
      nbre_pied: this.updated_Suivi.nbre_pied,
      hauteur: this.updated_Suivi.hauteur,
      dt_creation: moment().format('YYYY-MM-DD'),
      dt_modification: moment().format('YYYY-MM-DD'),
      img_cult: this.updated_Suivi.img_culture,
      dt_capture: null,
      ex: this.updated_Suivi.estimation,
      etat: SYNC
    }
    switch(src.src) {
      case 'sv-sg':
        this.crudDb.AddSuiviBl(add_suivi).then(res => {
          console.log("Res_ponse Add suivi:::", res);
          //this.suivi_sgForm.reset();
          this.isAddSuiviSg = false;
          this.indexRowEditMepSg = null;
          this.indexRowInfoMepSg = null;
          this.updated_Suivi = <Update_FormModal_Suivi_Mep_Bloc>{};
          this.loadMepBloc();
          setTimeout(() => {
            this.refreshDataSource();
            this.loadingCtrl.dismiss();
          }, 500);
          /**this.loadData.loadAllSuiviBloc({code_suivi: add_suivi.code_sv}).then(res_suivi => {
            console.log("Response load Suivi Mep bloc::: ", res_suivi);
            this.isAddSuiviSg = false;
            this.indexRowEditMepSg = null;
            this.indexRowInfoMepSg = null;
            this.updated_Suivi = <Update_FormModal_Suivi_Mep_Bloc>{};
            if (res_suivi.values.length > 0) {
              this.dataSourceMepSg.data.forEach(elem_sg => {
                if (elem_sg.code_culture === row_mep_selected.code_culture) {
                  elem_sg.suivi_Mep = [res_suivi.values[0], ...elem_sg.suivi_Mep];
                }
              });
            }
          });*/
        });
        break;
      case 'sv-pa':
        this.crudDb.AddSuiviBl(add_suivi).then(res => {
          console.log("Res_ponse Add suivi:::", res);
          //this.suivi_paForm.reset();
          this.isAddSuiviPa = false;
          this.indexRowEditMepPa = null;
          this.indexRowInfoMepPa = null;
          this.updated_Suivi = <Update_FormModal_Suivi_Mep_Bloc>{};
          this.loadMepBloc();
          setTimeout(() => {
            this.refreshDataSource();
            this.loadingCtrl.dismiss();
          }, 500);
          /**this.loadData.loadAllSuiviBloc({code_suivi: add_suivi.code_sv}).then(res_suivi => {
            console.log("Response load Suivi Mep bloc::: ", res_suivi);
            this.isAddSuiviPa = false;
            this.indexRowEditMepPa = null;
            this.indexRowInfoMepPa = null;
            this.updated_Suivi = <Update_FormModal_Suivi_Mep_Bloc>{};
            if (res_suivi.values.length > 0) {
              this.dataSourceMepPa.data.forEach(elem_pa => {
                if (elem_pa.code_culture === row_mep_selected.code_culture) {
                  elem_pa.suivi_Mep = [res_suivi.values[0], ...elem_pa.suivi_Mep];
                }
              });
            }
          });*/
        });
        break;
      case 'sv-mv':

        this.crudDb.AddSuiviBl(add_suivi).then(res => {
          console.log("Res_ponse Add suivi:::", res);
          this.isAddSuiviMv = false;
          this.indexRowEditMepMv = null;
          this.indexRowInfoMepMv = null;
          this.updated_Suivi = <Update_FormModal_Suivi_Mep_Bloc>{};
          this.loadMepBloc();
          setTimeout(() => {
            this.refreshDataSource();
            this.loadingCtrl.dismiss();
          }, 500);
          /**this.loadData.loadAllSuiviBloc({code_suivi: add_suivi.code_sv}).then(res_suivi => {
            console.log("Response load Suivi Mep bloc::: ", res_suivi);
            this.isAddSuiviMv = false;
            this.indexRowEditMepMv = null;
            this.indexRowInfoMepMv = null;
            this.updated_Suivi = <Update_FormModal_Suivi_Mep_Bloc>{};
            if (res_suivi.values.length > 0) {
              this.dataSourceMepMv.data.forEach(elem_mv => {
                if (elem_mv.code_culture === row_mep_selected.code_culture) {
                  elem_mv.suivi_Mep = [res_suivi.values[0], ...elem_mv.suivi_Mep];
                }
              });
            }
          });*/
        });
        break;
      default:
        console.log('default Caancel suivi')
        break;
    }
  }
  onCancelAddSuivi(src: any) {
    switch(src) {
      case 'sv-sg':
        this.isAddSuiviSg = false;
        this.indexRowEditMepSg = null;
        this.indexRowInfoMepSg = null;
        this.updated_Suivi = <Update_FormModal_Suivi_Mep_Bloc>{};
        break;
      case 'sv-pa':
        this.isAddSuiviPa = false;
        this.indexRowEditMepPa = null;
        this.indexRowInfoMepPa = null;
        this.updated_Suivi = <Update_FormModal_Suivi_Mep_Bloc>{};
        break;
      case 'sv-mv':
        this.isAddSuiviMv = false;
        this.indexRowEditMepMv = null;
        this.indexRowInfoMepMv = null;
        this.updated_Suivi = <Update_FormModal_Suivi_Mep_Bloc>{};
        break;
      default:
        console.log('default Caancel suivi')
        break;
    }
  }
  // Save Edit suivi
  onSaveEditSuivi(_data_: any) {

    let data_row: Loc_all_suivi_bloc = _data_.data;
    let data_update: UpdateSuiviBloc = {
      code_sv: data_row.code_sv,
      id_culture: data_row.id_culture,
      ddp: this.updated_Suivi.ddp,
      stc: this.updated_Suivi.stc != null?this.updated_Suivi.stc.value:null,
      ec: this.updated_Suivi.ec != null?this.updated_Suivi.ec.value:null,
      ql: this.updated_Suivi.ql,
      qr: this.updated_Suivi.qr,
      long_ligne: this.updated_Suivi.long_ligne,
      nbre_ligne: this.updated_Suivi.nbre_ligne,
      nbre_pied: this.updated_Suivi.nbre_pied,
      hauteur: this.updated_Suivi.hauteur,
      dt_creation: moment().format('YYYY-MM-DD'),
      dt_modification: moment().format('YYYY-MM-DD'),
      img_cult: this.updated_Suivi.img_culture,
      dt_capture: null,
      ex: this.updated_Suivi.estimation,
      etat: data_row.etat_suivi === SYNC?SYNC:UPDATE
    }
    switch(_data_.src) {
      case 'sv-sg':
        let _data_update_sg = {
          updated: data_update
        }
        this.crudDb.UpdateSuiviBl(_data_update_sg).then(res => {
          console.log("Res_ponse Add suivi:::", res);
          this.isRowSvSgEdit = false;
          this.indexRowEditMepSg = null;
          this.indexRowInfoMepSg = null;
          this.indexSg = null;
          this.updated_Suivi = <Update_FormModal_Suivi_Mep_Bloc>{};
          this.loadMepBloc();
          setTimeout(() => {
            this.refreshDataSource();
            this.loadingCtrl.dismiss();
          }, 500);
          /**this.loadData.loadAllSuiviBloc({code_culture: data_update.id_culture}).then(res_suivi => {
            console.log("Response load Suivi Mep bloc::: ", res_suivi);
            if (res_suivi.values.length > 0) {
              this.dataSourceMepSg.data.forEach(elem_sg => {
                if (elem_sg.code_culture === data_update.id_culture) {
                  elem_sg.suivi_Mep = res_suivi.values;
                }
              });
            }
          }); */     
        });
        
        break;
      case 'sv-pa':
        let _data_update_pa = {
          updated: data_update
        }
        this.crudDb.UpdateSuiviBl(_data_update_pa).then(res => {
          console.log("Res_ponse Add suivi:::", res);
          this.isRowSvPaEdit = false;
          this.indexRowEditMepPa = null;
          this.indexRowInfoMepPa = null;
          this.indexPa = null;
          this.updated_Suivi = <Update_FormModal_Suivi_Mep_Bloc>{};
          this.loadMepBloc();
          setTimeout(() => {
            this.refreshDataSource();
            this.loadingCtrl.dismiss();
          }, 500);

          /**this.loadData.loadAllSuiviBloc({code_culture: data_update.id_culture}).then(res_suivi => {
            console.log("Response load Suivi Mep bloc::: ", res_suivi);
            if (res_suivi.values.length > 0) {
              this.dataSourceMepPa.data.forEach(elem_pa => {
                if (elem_pa.code_culture === data_update.id_culture) {
                  elem_pa.suivi_Mep = res_suivi.values;
                }
              });
            }
          });*/
        });
        break;
      case 'sv-mv':
        let _data_update_mv = {
          updated: data_update
        }
        this.crudDb.UpdateSuiviBl(_data_update_mv).then(res => {
          console.log("Res_ponse Add suivi:::", res);
          this.isRowSvMvEdit = false;
          this.indexRowEditMepMv = null;
          this.indexRowInfoMepMv = null;
          this.indexMv = null;
          this.updated_Suivi = <Update_FormModal_Suivi_Mep_Bloc>{};
          this.loadMepBloc();
          setTimeout(() => {
            this.refreshDataSource();
            this.loadingCtrl.dismiss();
          }, 500);
          /**this.loadData.loadAllSuiviBloc({code_culture: data_update.id_culture}).then(res_suivi => {
            console.log("Response load Suivi Mep bloc::: ", res_suivi);
            if (res_suivi.values.length > 0) {
              this.dataSourceMepMv.data.forEach(elem_mv => {
                if (elem_mv.code_culture === data_update.id_culture) {
                  elem_mv.suivi_Mep = res_suivi.values;
                }
              });
            }
          }); */
        });
        break;
      default:
        console.log('default Caancel suivi')
        break;
    }
  }
  onCancelEditSuivi(src: any) {
    switch(src) {
      case 'sv-sg':
        this.isRowSvSgEdit = false;
        this.indexRowEditMepSg = null;
        this.indexRowInfoMepSg = null;
        this.indexSg = null;
        this.updated_Suivi = <Update_FormModal_Suivi_Mep_Bloc>{};
        break;
      case 'sv-pa':
        this.isRowSvPaEdit = false;
        this.indexRowEditMepPa = null;
        this.indexRowInfoMepPa = null;
        this.indexPa = null;
        this.updated_Suivi = <Update_FormModal_Suivi_Mep_Bloc>{};
        break;
      case 'sv-mv':
        this.isRowSvMvEdit = false;
        this.indexRowEditMepMv = null;
        this.indexRowInfoMepMv = null;
        this.indexMv = null;
        this.updated_Suivi = <Update_FormModal_Suivi_Mep_Bloc>{};
        break;
      default:
        console.log('default Caancel suivi')
        break;
    }
  }

  /**************************
  * Export Excelle
  **************************/
  onExport(parent: any) {
    switch(parent) {
    case 'mep-sg':
      let export_sg: Loc_export_excel[] = [
        {
          data: this.mep_export_sg,
          name_feuille: 'MEP SG',
          name_file: 'MEP_SG' + '_' + this.user[this.user.length - 1].id_equipe + this.projet.ancronyme
        },
        {
          data: this.sv_export_sg,
          name_feuille: 'SV SG',
          name_file: 'MEP_SG' + '_' + this.user[this.user.length - 1].id_equipe + this.projet.ancronyme
        }
      ]
      this.exportExcel.onExport(export_sg);
      break;
    case 'mep-pa':
      let export_pa: Loc_export_excel[] = [
        {
          data: this.mep_export_pa,
          name_feuille: 'MEP PA',
          name_file: 'MEP_PA' + '_' + this.user[this.user.length - 1].id_equipe + this.projet.ancronyme
        },
        {
          data: this.sv_export_pa,
          name_feuille: 'SV PA',
          name_file: 'MEP_PA' + '_' + this.user[this.user.length - 1].id_equipe + this.projet.ancronyme
        }
      ]
      this.exportExcel.onExport(export_pa);
      break;
    case 'mep-mv':
      let export_mv: Loc_export_excel[] = [
        {
          data: this.mep_export_mv,
          name_feuille: 'MEP MV',
          name_file: 'MEP_MV' + '_' + this.user[this.user.length - 1].id_equipe + this.projet.ancronyme
        },
        {
          data: this.sv_export_mv,
          name_feuille: 'SV MV',
          name_file: 'MEP_MV' + '_' + this.user[this.user.length - 1].id_equipe + this.projet.ancronyme
        }
      ]
      this.exportExcel.onExport(export_mv);
      break;
    case 'tout_mep':
      let export_tout_mep: Loc_export_excel[] = [
        {
          data: this.mep_export_sg,
          name_feuille: 'MEP SG',
          name_file: 'BL_MEP' + '_' + this.user[this.user.length - 1].id_equipe + this.projet.ancronyme
        },
        {
          data: this.sv_export_sg,
          name_feuille: 'SV SG',
          name_file: 'BL_MEP' + '_' + this.user[this.user.length - 1].id_equipe + this.projet.ancronyme
        },
        {
          data: this.mep_export_pa,
          name_feuille: 'MEP PA',
          name_file: 'BL_MEP' + '_' + this.user[this.user.length - 1].id_equipe + this.projet.ancronyme
        },
        {
          data: this.sv_export_pa,
          name_feuille: 'SV PA',
          name_file: 'BL_MEP' + '_' + this.user[this.user.length - 1].id_equipe + this.projet.ancronyme
        },
        {
          data: this.mep_export_mv,
          name_feuille: 'MEP MV',
          name_file: 'BL_MEP' + '_' + this.user[this.user.length - 1].id_equipe + this.projet.ancronyme
        },
        {
          data: this.sv_export_mv,
          name_feuille: 'SV MV',
          name_file: 'BL_MEP' + '_' + this.user[this.user.length - 1].id_equipe + this.projet.ancronyme
        }
      ]
      this.exportExcel.onExport(export_tout_mep);
      break;
    case 'sv-sg':
      let export_sv_sg: Loc_export_excel[] = [
        {
          data: this.mep_export_sg,
          name_feuille: 'MEP SG',
          name_file: 'SV_SG' + '_' + this.user[this.user.length - 1].id_equipe + this.projet.ancronyme
        },
        {
          data: this.sv_export_sg,
          name_feuille: 'SV SG',
          name_file: 'SV_SG' + '_' + this.user[this.user.length - 1].id_equipe + this.projet.ancronyme
        }
      ]
      this.exportExcel.onExport(export_sv_sg);
      break;
    case 'sv-mv':
      let export_sv_mv: Loc_export_excel[] = [
        {
          data: this.mep_export_mv,
          name_feuille: 'MEP MV',
          name_file: 'SV_MV' + '_' + this.user[this.user.length - 1].id_equipe + this.projet.ancronyme
        },
        {
          data: this.sv_export_mv,
          name_feuille: 'SV MV',
          name_file: 'SV_MV' + '_' + this.user[this.user.length - 1].id_equipe + this.projet.ancronyme
        }
      ]
      this.exportExcel.onExport(export_sv_mv);
      break;
    case 'sv-pa':
      let export_sv_pa: Loc_export_excel[] = [
        {
          data: this.mep_export_pa,
          name_feuille: 'MEP PA',
          name_file: 'SV_PA' + '_' + this.user[this.user.length - 1].id_equipe + this.projet.ancronyme
        },
        {
          data: this.sv_export_pa,
          name_feuille: 'SV PA',
          name_file: 'SV_PA' + '_' + this.user[this.user.length - 1].id_equipe + this.projet.ancronyme
        }
      ]
      this.exportExcel.onExport(export_sv_pa);
      break;
    }
  }
  
  async onFinished() {
    const loading = await this.loadingCtrl.create();
    await loading.present();
    if (this.isUpdated) {
      this.loadMepBloc();
    }
    this.initAction();
    setTimeout(() => {
      this.refreshDataSource();
      this.loadingCtrl.dismiss();
    }, 500);
  }

  // generate code Mep
  generateCodeMep() {
    let code_mep: string = '';
    let annee_ = this.update_mep.annee.annee_du.toString().charAt(2) + this.update_mep.annee.annee_du.toString().charAt(3) + this.update_mep.annee.annee_au.toString().charAt(2) + this.update_mep.annee.annee_au.toString().charAt(3);

    if (this.update_mep.saison != null) {
      return code_mep = this.update_mep.saison.intitule + annee_ + '-' +  this.update_mep.bloc.ordre + this.update_mep.bloc.ancronyme.toUpperCase() + '-' + 'Mep'; 
    } else {
      return code_mep =  this.update_mep.bloc.ordre + this.update_mep.bloc.ancronyme.toUpperCase() + '-' + annee_ + 'Mep'; 
    }
  }

  // modal
  async presentModal(source: any) {
    let modal: any;
    let elem = {
      component: ModalBlocPage,
      cssClass: 'my-custom-modal-suivi',
      backdropDismiss: false,
      componentProps: {
        isSuivi: true,
        isAddMep: true,
        source_: '',
        data_: source.data
      }
    }
    switch(source.src) {
      case 'mep-sg':
        elem.componentProps.source_ = 'isAddMepSg';
        modal = await this.modalCtrl.create(elem);
        break;
      case 'mep-pa':
        elem.componentProps.source_ = 'isAddMepPa';
        modal = await this.modalCtrl.create(elem);
        break;
      case 'mep-mv':
        elem.componentProps.source_ = 'isAddMepMv';
        modal = await this.modalCtrl.create(elem);
        break;
      default:
        console.log("default Add present modale!");
        break;
    }

    modal.onDidDismiss().then((res_modal) => {
      console.log(res_modal);
      ///this.update_mep = {};

      if (res_modal.data != undefined) {
        let data_modal = res_modal.data;
        if ((data_modal.isAddMepSg != undefined && data_modal.isAddMepSg) || (data_modal.isAddMepPa != undefined && data_modal.isAddMepPa) || (data_modal.isAddMepMv != undefined &&  data_modal.isAddMepMv)) {
          this.update_mep = data_modal.data_;
          this.update_mep.ddp = this.update_mep.ddp != null?data_modal.data_.ddp.format("YYYY-MM-DD"):null;
          this.update_mep.dds = this.update_mep.dds != null?data_modal.data_.dds.format("YYYY-MM-DD"):null;
          this.update_mep.dt_distribution = this.update_mep.dt_distribution != null?data_modal.data_.dt_distribution.format("YYYY-MM-DD"):null;
  
          if ((data_modal.isAddMepSg != undefined && data_modal.isAddMepSg) || (data_modal.isAddMepMv != undefined &&  data_modal.isAddMepMv)) {
            
            if (data_modal.isAddMepMv != undefined &&  data_modal.isAddMepMv) {
              this.isAddMepMv = true;
              if (source.index_info != undefined) {
                this.indexRowInfoMepMv = source.index_info;
              } else {
                this.onSaveAddMep('mep-mv');
              }
              console.log('Dismissed Add MV..', data_modal.data_);
            } else if(data_modal.isAddMepSg != undefined && data_modal.isAddMepSg) {
              console.log('Dismissed Add Sg..', data_modal.data_);
              this.isAddMepSg = true;
              if (source.index_info != undefined) {
                this.indexRowInfoMepSg = source.index_info;
              } else {
                this.onSaveAddMep('mep-sg');
              }
            }
          } else if (data_modal.isAddMepPa != undefined && data_modal.isAddMepPa) {
            this.isAddMepPa = true;
            if (source.index_info != undefined) {
              this.indexRowInfoMepPa = source.index_info;
            } else {
              this.onSaveAddMep('mep-pa');
            }
            console.log('Dismissed Add PA..', data_modal.data_);
          }
        }
      }
    });
    await modal.present();
  }

  // modal Edit
  async presentModalEdit(src: any) {
    let modal: any;
    console.log("Edit modale::::", src.data);
    switch(src.src) {
      case 'mep-sg':
        modal = await this.modalCtrl.create({
          component: ModalBlocPage,
          cssClass: 'my-custom-modal-suivi',
          backdropDismiss: false,
          componentProps: {
            isSuivi: true,
            isEditMepSg: true,
            data_: src.data_
          }
        });
        break;
      case 'mep-pa':
        modal = modal = await this.modalCtrl.create({
          component: ModalBlocPage,
          cssClass: 'my-custom-modal-suivi',
          backdropDismiss: false,
          componentProps: {
            isSuivi: true,
            isEditMepPa: true,
            data_: src.data_
          }
        });
        break;
      case 'mep-mv':
        modal = modal = await this.modalCtrl.create({
          component: ModalBlocPage,
          cssClass: 'my-custom-modal-suivi',
          backdropDismiss: false,
          componentProps: {
            isSuivi: true,
            isEditMepMv: true,
            data_: src.data_
          }
        });
        break;
      default:
        console.log("default Edit")
        break;
    }
    modal.onDidDismiss().then((res_modal) => {
      console.log(res_modal);
      //this.update_mep = {};
      if (res_modal.data != undefined) {
        let data_modal: any = res_modal.data;
        this.update_mep = data_modal.data_;
        this.update_mep.ddp = this.update_mep.ddp != null?data_modal.data_.ddp.format("YYYY-MM-DD"):null;
        this.update_mep.dds = this.update_mep.dds != null?data_modal.data_.dds.format("YYYY-MM-DD"):null;
        this.update_mep.dt_distribution = this.update_mep.dt_distribution != null?data_modal.data_.dt_distribution.format("YYYY-MM-DD"):null;

        if ((data_modal.isEditMepSg != undefined && data_modal.isEditMepSg) || (data_modal.isEditMepMv != undefined && data_modal.isEditMepMv) || (data_modal.isEditMepPa != undefined && data_modal.isEditMepPa)) {
          console.log('Dismissed Edit Mep...', this.update_mep);

          if ((data_modal.isEditMepSg != undefined && data_modal.isEditMepSg) ||  (data_modal.isEditMepMv != undefined && data_modal.isEditMepMv)) {
  
            if (data_modal.isEditMepSg != undefined && data_modal.isEditMepSg) {
              this.isRowMepSgEdit = true;
              this.indexRowInfoMepSg = src.index_info;
  
            } else if (data_modal.isEditMepMv != undefined && data_modal.isEditMepMv){
              this.isRowMepMvEdit = true;
              this.indexRowInfoMepMv = src.index_info;
              console.log("Dismissed Mep Edit MV:::: ", this.update_mep);
            }
          } else if (data_modal.isEditMepPa != undefined && data_modal.isEditMepPa) {
            this.isRowMepPaEdit = true;
            this.indexRowInfoMepPa = src.index_info;
            console.log("Dismissed Mep Edit PA:::: ", this.update_mep);
          }
        } 
      }
    });
    await modal.present();
  }

  // modal updated suivi
  async onUpdateSuivi(data: any) {
    //onUpdateSuivi({action: 'add', src: 'mep-pa', row_mep:  element_mep, index_mep: ind_mep, index_info: ind_info_mep})
    let data_: any;
    if (data.action === 'add') {
      if (data.src === 'mep-sg') {
        data_ = {
          isSuiviMepBloc: true,
          isAddSvSg: true,
          data_mep: data.row_mep,
          espece: this.data_espece,
          variette: this.data_var
        }
      } else if (data.src === 'mep-pa') {
        data_ = {
          isSuiviMepBloc: true,
          isAddSvPa: true,
          data_mep: data.row_mep,
          espece: this.data_espece,
          variette: this.data_var
        }
      } else if (data.src === 'mep-mv') {
        data_ = {
          isSuiviMepBloc: true,
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
          isSuiviMepBloc: true,
          isEditSvSg: true,
          data_mep: data.row_mep,
          data_elem_suivi: data.row_suivi,
          espece: this.data_espece,
          variette: this.data_var
        }
      } else if (data.src === 'mep-pa') {
        data_ = {
          isSuiviMepBloc: true,
          isEditSvPa: true,
          data_mep: data.row_mep,
          data_elem_suivi: data.row_suivi,
          espece: this.data_espece,
          variette: this.data_var
        }
      } else if (data.src === 'mep-mv') {
        data_ = {
          isSuiviMepBloc: true,
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
        let elem_mep: Loc_all_suivi_bloc = data.row_mep;
        this.updated_Suivi = modal_data.data;
        this.updated_Suivi.ddp = modal_data.data.ddp.format("YYYY-MM-DD");
        this.updated_Suivi.unite_estimation = elem_mep.unite_estimation;
        if (data.action === 'add') {
          switch(data.src) {
            case 'mep-sg':
              this.isAddSuiviSg = true;
              this.indexRowEditMepSg = data.index_mep;
              this.indexRowInfoMepSg = data.index_info;
              break;
            case 'mep-pa':
              this.isAddSuiviPa = true;
              this.indexRowEditMepPa = data.index_mep;
              this.indexRowInfoMepPa = data.index_info;
              break;
            case 'mep-mv':
              this.isAddSuiviMv = true;
              this.indexRowEditMepMv = data.index_mep;
              this.indexRowInfoMepMv = data.index_info;
              break;
            default:
              console.log("default");
              break;
          }
        } else if (data.action === 'edit') {
          //let data_ = {src: 'add', data: element, index: i};
          switch(data.src) {
            case 'mep-sg':
              this.isRowSvSgEdit = true;
              this.indexRowEditMepSg = data.index_mep;
              this.indexRowInfoMepSg = data.index_info;
              this.indexSg = data.index_mep_suivi;
              break;
            case 'mep-pa':
              this.isRowSvPaEdit = true;
              this.indexRowEditMepPa = data.index_mep;
              this.indexRowInfoMepPa = data.index_info;
              this.indexPa = data.index_mep_suivi;
              break;
            case 'mep-mv':
              this.isRowSvMvEdit = true;
              this.indexRowEditMepMv = data.index_mep;
              this.indexRowInfoMepMv = data.index_info;
              this.indexMv = data.index_mep_suivi;
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

  initAction() {
    if (this.isUpdated) {
      // remove action column
      this.isRowMepMvEdit = false;
      this.isRowMepPaEdit = false;
      this.isRowMepSgEdit = false;
      this.isAddMepSg = false;
      this.isAddMepPa = false;
      this.isAddMepMv = false;
      this.isUpdated = false;
      this.indexRowEditMepMv = null;
      this.indexRowEditMepPa  = null;
      this.indexRowEditMepSg = null;
      // 
      this.indexRowInfoMepMv = null;
      this.indexRowInfoMepPa = null;
      this.indexRowInfoMepSg = null;
      //
      this.update_mep = <update_Mep_form>{};
      //this.update_mep = null;
    }
    // init Suivi semences en grains
    if (this.isAddSuiviSg) {
      this.isAddSuiviSg = false;
      this.indexRowEditMepSg = null;
      this.updated_Suivi = <Update_FormModal_Suivi_Mep_Bloc>{};
    }
    if (this.isRowSvSgEdit) {
      this.isRowSvSgEdit = false;
      this.indexRowEditMepSg = null;
      this.indexMv = null;
      this.updated_Suivi = <Update_FormModal_Suivi_Mep_Bloc>{};
    }
    
    // init  Suivi plants d'arbres
    if (this.isAddSuiviPa) {
      this.isAddSuiviPa = false;
      this.indexRowEditMepPa = null;
      this.updated_Suivi = <Update_FormModal_Suivi_Mep_Bloc>{};
    }
    if (this.isRowSvPaEdit) {
      this.isRowSvPaEdit = false;
      this.indexRowEditMepPa = null;
      this.indexPa = null;
      this.updated_Suivi = <Update_FormModal_Suivi_Mep_Bloc>{};
    }

    // init Suivi Materials cultures
    if (this.isAddSuiviMv) {
      this.isAddSuiviMv = false;
      this.indexRowEditMepMv = null;
      this.updated_Suivi = <Update_FormModal_Suivi_Mep_Bloc>{};
    }
    if (this.isRowSvMvEdit) {
      this.isRowSvMvEdit = false;
      this.indexRowEditMepMv = null;
      this.indexMv = null;
      this.updated_Suivi = <Update_FormModal_Suivi_Mep_Bloc>{};
    }
  }

  // refresh data source
  refreshDataSource() {
    this.mep_info_sg = [];
    this.mep_info_pa = [];
    this.mep_info_mv = [];

    let data_suivi_sg: Loc_all_suivi_bloc[] = [];
    let data_suivi_pa: Loc_all_suivi_bloc[] = [];
    let data_suivi_mv: Loc_all_suivi_bloc[] = [];
    //
    this.src_MepMv = [];
    this.src_MepPa = [];
    this.src_MepSg = [];
    if (this.data_Mep.length > 0) {
      this.data_Mep.forEach(item_mep => {
        if (this.data_all_suivi_mep.length > 0) {
          item_mep.suivi_Mep = this.data_all_suivi_mep.filter(item_suivi => {return item_suivi.id_culture === item_mep.code_culture});
        } else item_mep.suivi_Mep = [];
      });
    }
    this.src_MepSg = this.data_Mep.length > 0? this.data_Mep.filter(item => {return item.type === SG}):[];
    this.src_MepPa = this.data_Mep.length > 0? this.data_Mep.filter(item => {return item.type === PA}):[];
    this.src_MepMv = this.data_Mep.length > 0? this.data_Mep.filter(item => {return item.type === MV}):[];
    // mep info sg
    if (this.src_MepSg.length > 0) {
      this.src_MepSg.forEach((elem_mep_sg, ind) => {
        let verif_parce = this.mep_info_sg.filter(item => {return item.id_parce === elem_mep_sg.id_parce && item.id_annee === elem_mep_sg.id_annee});
        if (verif_parce.length === 0) {
          this.mep_info_sg.push({
            code_bloc: elem_mep_sg.code_bloc,
            nom_bl: elem_mep_sg.nom_bl,
            id_annee: elem_mep_sg.id_annee,
            annee_du: elem_mep_sg.annee_du,
            annee_au: elem_mep_sg.annee_au,
            code_benef_bl: elem_mep_sg.code_benef_bl,
            code_benef_bl_temp: elem_mep_sg.code_benef_bl_temp,
            nom: elem_mep_sg.nom,
            prenom: elem_mep_sg.prenom,
            id_parce: elem_mep_sg.id_parce,
            code_parce_temp: elem_mep_sg.code_parce_temp,
            sfce_reel: elem_mep_sg.sfce_reel,
            lat: elem_mep_sg.lat,
            log: elem_mep_sg.log,
            mep: [],
            isExpanded: false
          });
        }
        // Export SV
        if (elem_mep_sg.suivi_Mep.length > 0) {
          elem_mep_sg.suivi_Mep.forEach((elem_suivi, ind_suivi) => {
            data_suivi_sg.push(elem_suivi);
            // Fin du boucle suivi
            if ((elem_mep_sg.suivi_Mep.length - 1) === ind_suivi) {
              // Fin du boucle Export MEP
              if ((this.src_MepSg.length - 1) === ind) {
                this.loadDataExportSvSg(data_suivi_sg);
              }
            }
          });
        } else {
          // Fin du boucle Export MEP
          if ((this.src_MepSg.length - 1) === ind) {
            this.loadDataExportSvSg(data_suivi_sg);
          }
        }
      });
      this.mep_info_sg.forEach(mep_info_sg => {
        mep_info_sg.mep = this.src_MepSg.filter(item_sg => {return item_sg.id_parce === mep_info_sg.id_parce && item_sg.id_annee === mep_info_sg.id_annee});
      });
    }
    // mep info pa
    if (this.src_MepPa.length > 0) {
      this.src_MepPa.forEach((elem_mep_pa, ind_pa) => {
        let verif_parce = this.mep_info_pa.filter(item_pa => {return item_pa.id_parce === elem_mep_pa.id_parce && item_pa.id_annee === elem_mep_pa.id_annee});
        if (verif_parce.length === 0) {
          this.mep_info_pa.push({
            code_bloc: elem_mep_pa.code_bloc,
            nom_bl: elem_mep_pa.nom_bl,
            id_annee: elem_mep_pa.id_annee,
            annee_du: elem_mep_pa.annee_du,
            annee_au: elem_mep_pa.annee_au,
            code_benef_bl: elem_mep_pa.code_benef_bl,
            code_benef_bl_temp: elem_mep_pa.code_benef_bl_temp,
            nom: elem_mep_pa.nom,
            prenom: elem_mep_pa.prenom,
            id_parce: elem_mep_pa.id_parce,
            code_parce_temp: elem_mep_pa.code_parce_temp,
            sfce_reel: elem_mep_pa.sfce_reel,
            lat: elem_mep_pa.lat,
            log: elem_mep_pa.log,
            mep: [],
            isExpanded: false
          });
        }
        // Export
        if (elem_mep_pa.suivi_Mep.length > 0) {
          elem_mep_pa.suivi_Mep.forEach((elem_suivi, ind_suivi) => {
            data_suivi_pa.push(elem_suivi);
            // Fin du boucle suivi
            if ((elem_mep_pa.suivi_Mep.length - 1) === ind_suivi) {
              // Fin du boucle Export MEP
              if ((this.src_MepPa.length - 1) === ind_pa) {
                this.loadDataExportSvPa(data_suivi_pa);
              }
            }
          });
        } else {
          // Fin du boucle Export MEP
          if ((this.src_MepPa.length - 1) === ind_pa) {
            this.loadDataExportSvPa(data_suivi_pa);
          }
        }
      });
      this.mep_info_pa.forEach(elem_mep_info_pa => {
        elem_mep_info_pa.mep = this.src_MepPa.filter(item_mep_pa => {return item_mep_pa.id_parce === elem_mep_info_pa.id_parce && item_mep_pa.id_annee === elem_mep_info_pa.id_annee});
      });
    }
    // mep info mv
    if (this.src_MepMv.length > 0) {
      this.src_MepMv.forEach((elem_mep_mv, ind_mv) => {
        let verif_parce = this.mep_info_mv.filter(item_mv => {return item_mv.id_parce === elem_mep_mv.id_parce && item_mv.id_annee === elem_mep_mv.id_annee});
        if (verif_parce.length === 0) {
          this.mep_info_mv.push({
            code_bloc: elem_mep_mv.code_bloc,
            nom_bl: elem_mep_mv.nom_bl,
            id_annee: elem_mep_mv.id_annee,
            annee_du: elem_mep_mv.annee_du,
            annee_au: elem_mep_mv.annee_au,
            code_benef_bl: elem_mep_mv.code_benef_bl,
            code_benef_bl_temp: elem_mep_mv.code_benef_bl_temp,
            nom: elem_mep_mv.nom,
            prenom: elem_mep_mv.prenom,
            id_parce: elem_mep_mv.id_parce,
            code_parce_temp: elem_mep_mv.code_parce_temp,
            sfce_reel: elem_mep_mv.sfce_reel,
            lat: elem_mep_mv.lat,
            log: elem_mep_mv.log,
            mep: [],
            isExpanded: false
          });
        }
        this.mep_info_mv.forEach(elem_mep_info_mv => {
          elem_mep_info_mv.mep = this.src_MepMv.filter(item_mep_mv => {return item_mep_mv.id_parce === elem_mep_info_mv.id_parce && item_mep_mv.id_annee === elem_mep_info_mv.id_annee});
        });
        // Elem MEP
        if (elem_mep_mv.suivi_Mep.length > 0) {
          elem_mep_mv.suivi_Mep.forEach((elem_suivi, ind_suivi) => {
            data_suivi_mv.push(elem_suivi);
            // Fin du boucle suivi
            if ((elem_mep_mv.suivi_Mep.length - 1) === ind_suivi) {
              // Fin du boucle Export MEP
              if ((this.src_MepMv.length - 1) === ind_mv) {
                this.loadDataExportSvMv(data_suivi_mv);
              }
            }
          });
        } else {
          // Fin du boucle Export MEP
          if ((this.src_MepMv.length - 1) === ind_mv) {
            this.loadDataExportSvMv(data_suivi_mv);
          }
        }
      });
    }
    this.loadDataExportSg(this.src_MepSg);
    this.loadDataExportPa(this.src_MepPa);
    this.loadDataExportMv(this.src_MepMv);

    this.dataSourceInfoMepSg.data = this.mep_info_sg;
    this.dataSourceInfoMepPa.data = this.mep_info_pa;
    this.dataSourceInfoMepMv.data = this.mep_info_mv;

  }

  loadDataExportSg(mep_sg: Loc_mep_bloc[]) {
    this.mep_export_sg = [];
    if (mep_sg.length > 0) {
      mep_sg.forEach(elem => {
        this.mep_export_sg.push({
          Annee_du: elem.annee_du + '-' + elem.annee_au,
          Bloc: elem.nom_bl,
          Code_mep: elem.code_culture_temp,
          Saison: elem.intitule,
          'Code Parce': elem.code_parce_temp,
          'Sfce reel(m²)': elem.sfce_reel,
          Code_benef: elem.code_benef_bl_temp,
          Nom: elem.nom,
          Prenom: elem.prenom,
          'Sexe': elem.sexe,
          'CIN': elem.cin,
          DDP: elem.ddp != null?moment(elem.ddp).format("DD/MM/YYYY"):elem.ddp,
          Variété: elem.nom_var,
          QSO: elem.qso,
          'Unité': elem.unite_espece,
          DDS: elem.dds != null?moment(elem.dds).format("DD/MM/YYYY"):elem.dds,
          'Sfce Emblavée(m²)': elem.sfce,
          'SC': elem.sc,
          EA: elem.ea,
          Nb_ligne: elem.nbre_ligne,
          'Long ligne(m)': elem.long_ligne
        });
      });
    }
  }
  loadDataExportPa(mep_pa: Loc_mep_bloc[]) {
    this.mep_export_pa = [];
    if (mep_pa.length > 0) {
      mep_pa.forEach(elem => {
        this.mep_export_pa.push({
          Annee_du: elem.annee_du + '-' + elem.annee_au,
          Bloc: elem.nom_bl,
          'Code MEP': elem.code_culture_temp,
          Saison: elem.intitule, 
          'Code Parce': elem.code_parce_temp,
          'Sfce_reel(m²)': elem.sfce_reel, 
          'Code benef': elem.code_benef_bl_temp,
          Nom: elem.nom,
          Prenom: elem.prenom,
          'Sexe': elem.sexe,
          'CIN': elem.cin,
          DDP: elem.ddp != null?moment(elem.ddp).format("DD/MM/YYYY"):elem.ddp,
          Espece: elem.nom_espece,
          'Dt distribution': elem.dt_distribution != null?moment(elem.dt_distribution).format("DD/MM/YYYYY"):elem.dt_distribution,
          QO: elem.qso,
          'Unité': elem.unite_espece,
          'Dt MEP': elem.dds,
          'Nbre Ligne': elem.nbre_ligne,
          'Long ligne(m)': elem.long_ligne
        });
      });
    }
  }
  loadDataExportMv(mep_mv: Loc_mep_bloc[]) {
    this.mep_export_mv = [];
    if (mep_mv.length > 0) {
      mep_mv.forEach(elem => {
        this.mep_export_mv.push({
          'Annee Agricole': elem.annee_du + '-' + elem.annee_au,
          Bloc: elem.nom_bl,
          'Code MEP': elem.code_culture_temp,
          Saison: elem.intitule,
          'Code Parce': elem.code_parce_temp,
          'Sfce reel(m²)': elem.sfce_reel, 
          'Code benef': elem.code_benef_bl_temp,
          Nom: elem.nom,
          Prenom: elem.prenom,
          'Sexe': elem.sexe,
          'CIN': elem.cin,
          DDP: elem.ddp != null?moment(elem.ddp).format("DD/MM/YYYY"):elem.ddp,
          Espece: elem.nom_espece,
          QSO: elem.qso,
          'Unité': elem.unite_espece,
          Dt_MEP: elem.dds != null?moment(elem.dds).format("DD/MM/YYYY"):elem.dds,
          'Sfce Emblavée(m²)': elem.sfce,
          SC: elem.sc,
          EA: elem.ea,
          'Nbre Ligne': elem.nbre_ligne,
          'Long ligne(m)': elem.long_ligne
        });
      });
    }
  }

  loadDataExportSvSg(data_suivi_sg: Loc_all_suivi_bloc[]) {
    if (data_suivi_sg.length > 0) {
      this.sv_export_sg = [];
      data_suivi_sg.forEach(elem_sg => {
        let ec_intitule: string = '';
        let stc_intitule: string = '';
        EC_CULTURAL.forEach(elem_ec => {
          if (elem_ec.value === elem_sg.ec) {
            ec_intitule = elem_ec.intitule;
          }
        });
        STC.forEach(elem_stc => {
          if (elem_stc.value === elem_sg.stc) {
            stc_intitule = elem_stc.intitule;
          }
        });

        this.sv_export_sg.push({
          'Code Suivi': elem_sg.code_sv,
          Annee_du: elem_sg.annee_du + '-' + elem_sg.annee_au,
          Saison: elem_sg.saison, 
          Bloc: elem_sg.bloc,
          'Code Parce': elem_sg.code_parce_temp,
          'Sfce reel(m²)': elem_sg.sfce_reel, 
          Code_benef: elem_sg.code_benef_bl_temp,
          Nom: elem_sg.nom,
          Prenom: elem_sg.prenom,
          'Sexe': elem_sg.sexe,
          'CIN': elem_sg.cin,
          DDP: elem_sg.ddp != null?moment(elem_sg.ddp).format("DD/MM/YYYY"):elem_sg.ddp,
          Code_MEP: elem_sg.code_culture_temp,
          Variété: elem_sg.variette,
          QSO: elem_sg.qso,
          'Unite': elem_sg.unite_espece,
          DDS: elem_sg.dds != null?moment(elem_sg.dds).format("DD/MM/YYYY"):elem_sg.dds,
          'Sfce Emblavée(m²)': elem_sg.sfce,
          SC: elem_sg.mep_sc,
          stc: stc_intitule,
          Etat: ec_intitule,
          'Long ligne(m)': elem_sg.long_ligne,
          Nbre_ligne: elem_sg.nbre_ligne,
          Estimation: elem_sg.ex,
          'Unité': elem_sg.unite_estimation
        });
      });
    }
  }
  loadDataExportSvMv(data_suivi_mv: Loc_all_suivi_bloc[]) {
    if (data_suivi_mv.length > 0) {
      this.sv_export_mv = [];
      data_suivi_mv.forEach(elem_mv => {
        this.sv_export_mv.push({
          'Code Suivi': elem_mv.code_sv,
          Annee_du: elem_mv.annee_du + '-' + elem_mv.annee_au,
          Saison: elem_mv.saison, 
          Bloc: elem_mv.bloc,
          'Code Parce': elem_mv.code_parce_temp,
          'Sfce reel(m²)': elem_mv.sfce_reel, 
          Code_benef: elem_mv.code_benef_bl_temp,
          Nom: elem_mv.nom,
          Prenom: elem_mv.prenom,
          'Sexe': elem_mv.sexe,
          'CIN': elem_mv.cin,
          DDP: elem_mv.ddp != null?moment(elem_mv.ddp).format("DD/MM/YYYY"):elem_mv.ddp,
          Code_MEP: elem_mv.code_culture_temp,
          Espece: elem_mv.espece,
          QSO: elem_mv.qso,
          'Unité': elem_mv.unite_espece,
          Dt_MEP: elem_mv.dds != null?moment(elem_mv.dds).format("DD/MM/YYYY"):elem_mv.dds,
          'Sfce Emblavée(m²)': elem_mv.sfce,
          SC: elem_mv.mep_sc,
          'Nbre pieds': elem_mv.nbre_pied,
          "Long ligne(m)": elem_mv.long_ligne,
          'Nbre ligne': elem_mv.nbre_ligne,
          'Estimaation': elem_mv.ex,
          'Unité estimation': elem_mv.unite_estimation
        });
      });
    }
  }
  loadDataExportSvPa(data_suivi_pa: Loc_all_suivi_bloc[]) {
    if (data_suivi_pa.length > 0) {
      this.sv_export_pa = [];
      data_suivi_pa.forEach(elem_pa => {
        let ec_intitule: string = '';
        EC_CULTURAL.forEach(elem_ec => {
          if (elem_ec.value === elem_pa.ec) {
            ec_intitule = elem_ec.intitule;
          }
        });

        this.sv_export_pa.push({
          'Code Suivi': elem_pa.code_sv,
          Annee_du: elem_pa.annee_du + '-' + elem_pa.annee_au,
          Saison: elem_pa.saison, 
          Bloc: elem_pa.bloc,
          'Code Parce': elem_pa.code_parce_temp,
          'Sfce reel(m²)': elem_pa.sfce_reel, 
          'Code Benef': elem_pa.code_benef_bl_temp,
          Nom: elem_pa.nom,
          Prenom: elem_pa.prenom,
          'Sexe': elem_pa.sexe,
          'CIN': elem_pa.cin,
          DDP: elem_pa.ddp != null?moment(elem_pa.ddp).format("DD/MM/YYYY"):elem_pa.ddp,
          'Code MEP': elem_pa.code_culture_temp,
          Espece: elem_pa.espece,
          QO: elem_pa.qso,
          'Unité': elem_pa.unite_espece,
          Dt_MEP: elem_pa.dds != null?moment(elem_pa.dds).format("DD/MM/YYYY"):elem_pa.dds,
          'Sfce Emblavée(m²)': elem_pa.sfce,
          QL: elem_pa.ql,
          Etat: ec_intitule,
          'Nb ligne': elem_pa.nbre_ligne,
          Hauteur: elem_pa.hauteur,
          'QR(en 1 ans)': elem_pa.qr
        });
      });
    }
  }

  toggleTableRows(src:any) {
    switch(src.src) {
      case 'mep-sg':
        this.isTableSgExpanded = !this.isTableSgExpanded;
        this.dataSourceInfoMepSg.data.forEach((row: Loc_mep_info_bloc) => {
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
        this.dataSourceInfoMepPa.data.forEach((row: Loc_mep_info_bloc) => {
          if (row.mep.length > 0) {
            row.isExpanded = this.isTableSgExpanded;
          } else {
            if (row.isExpanded) {
              row.isExpanded = false;
            }
          }
        });
        break;
      case 'mep-mv':
        this.isTableMvExpanded = !this.isTableMvExpanded;
        this.dataSourceInfoMepMv.data.forEach((row: Loc_mep_info_bloc) => {
          if (row.mep.length > 0) {
            row.isExpanded = this.isTableSgExpanded;
          } else {
            if (row.isExpanded) {
              row.isExpanded = false;
            }
          }
        });
        break
    }
  }
  onAddShowSuivi(data: any) {
    //let data_ = {data: row, index_: i}
    console.log(data);
    switch(data.src) {
      case 'mep-sg':
        this.dataSourceMepSg.data.forEach((row, ind) => {
          if (ind === data.index_) {
            row.isExpanded = true;
          }
        });
        break;
      case 'mep-pa':
        this.dataSourceMepPa.data.forEach((row, ind) => {
          if (ind === data.index_) {
            row.isExpanded = true;
          }
        });
        break;
      case 'mep-mv':
        this.dataSourceMepMv.data.forEach((row, ind) => {
          if (ind === data.index_) {
            row.isExpanded = true;
          }
        });
        break;
      default:
        console.log("default");
        break;
    }
  }

  // Event selected matgroupe
  async selectMatTab(index: number) {
    console.log("index Mat-Tab Selected :: " + index);
    this.initAction();
    //this.suiviForm.reset();
    if (index == 0) {
      console.log("selected index 0*******");
      this.refreshDataSource();
    } else if (index == 1) {
      const loading = await this.loadingCtrl.create();
      await loading.present();
      console.log("selected index 1*******");
      this.loadMepBloc();
      this.loadAllSuiviBloc();
    } 
  }

  loadAnneeAgricole() {
    this.loadData.loadAnneeAgricole().then(res => {
      this.data_annee_agricole = res.values;
    });
  }

  // Accordion
  logAccordionValue() {
    console.log(this.accordionGroup.value);
  }
  
  closeAccordion() {
    let null_val = '';
    if (null_val == null) {
      console.log(" Null condition, Value of::::", null_val.valueOf());
    }

    if (null_val == '') {
      console.log("'' condition, Value of::::", null_val.valueOf());
      let espece_ea: Loc_Espece;
      console.log("Espece null, Value::::", espece_ea);
    }
    this.accordionGroup.value = undefined;
  }
  onClick() {
    this.router.navigate(['homes']);
  }
}


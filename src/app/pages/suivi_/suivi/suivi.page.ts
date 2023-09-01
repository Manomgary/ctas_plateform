import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingController, ModalController, Platform, ToastController } from '@ionic/angular';
import { BehaviorSubject } from 'rxjs';
import { LoadDataService } from 'src/app/services/local/load-data.service';
import { Utilisateurs } from 'src/app/utils/interface-bd';
import { ModalPage } from '../../modal/modal.page';

import * as XLSX from 'xlsx';
import { File } from '@ionic-native/file/ngx';
import { Benef_activ_pms, controle_culte, declaration_culte, Local_Parcelle, Loc_all_contrat_pms, Loc_all_suivi_mep, Loc_AnneeAgricole, Loc_association, Loc_culture_Pms, Loc_Espece, Loc_export_excel, Loc_projet, Loc_saison, Loc_suivi_mep, Loc_variette, sc_culture, stc_ec_culte } from 'src/app/interfaces/interfaces-local';
import { Db_Culture_pms, Db_suivi_pms } from 'src/app/interfaces/interface-insertDb';

// DATE IMPORT 
import * as _moment from 'moment';
import { Moment } from 'moment';
import { CrudDbService } from 'src/app/services/local/crud-db.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

// Add the new import Image
import { CONTROLE_MEP, DECLARATION_MEP, EC, EC_CULTURAL, IMAGE_DIR, STC, SYNC, UPDATE } from 'src/app/utils/global-variables';
import { SuiviPageRoutingModule } from './suivi-routing.module';
import { SharedService } from 'src/app/services/shared.service';
import { CaptureImageService } from 'src/app/services/capture-image.service';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { ExportExcelService } from 'src/app/services/export-excel.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from 'src/app/component/dialog/dialog.component';

const moment = _moment;

interface Mep_Add {
  annee: Loc_AnneeAgricole,
  saison: Loc_saison,
  association: Loc_association,
  pms: Benef_activ_pms,
  contrat: Loc_all_contrat_pms,
  parcelle: Local_Parcelle,
  ddp: string,
  espece: Loc_Espece,
  variette: Loc_variette,
  qsa: number,
  dds: string,
  sfce: number,
  sc: sc_culture,
  espece_associe: Loc_Espece,
  variette_associe: Loc_variette,
  autreEa: string,
  nb_ligne: number,
  long_ligne: number
}
// Interface Export Mep 
interface Mep_export {
  Annee_du: string,
  Saison: string,
  Association: string,
  Code_pms: string,
  Nom: string,
  Prenom: string,
  Code_parce: string,
  Sfce_reel: number,
  DDP: string,
  variette: string,
  QSA: number,
  DDS: string,
  sfce_emblavee: number,
  code_achat: string,
  SC: string,
  EA :string
}
interface Suivi_export {
  Saison: string,
  Annee: string,
  Association: string,
  Code_pms: string,
  Code_achat: string,
  Nom: string,
  Prenom: string,
  Code_parce: string,
  variette: string,
  QSA: number,
  DDS: string,
  Sfce_emblavee: number,
  DDP: string,
  STC: string,
  EC: string,
  PB: string,
  EX: number,
  Controle: string,
  Declaration: string
}

export interface suivi_mep {
  ddp: string,
  stc: stc_ec_culte,
  ec: stc_ec_culte,
  pb: string,
  ex: number,
  img_culte: string,
  controle: controle_culte,
  declaration: declaration_culte
}

@Component({
  selector: 'app-suivi',
  templateUrl: './suivi.page.html',
  styleUrls: ['./suivi.page.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ])
  ]
})
export class SuiviPage implements OnInit, AfterViewInit, OnDestroy {

  private isRouterActive: BehaviorSubject<boolean> = new BehaviorSubject(false);

  private region: any;
  private district: any;
  private commune: any;
  private projet: Loc_projet;
  private user: Utilisateurs[];
  private activite: string;
  private isUpdated: boolean = false;
  private isAddMep: boolean = false;
  private mep_culte: Mep_Add = {
    annee: null,
    saison: null,
    association: null,
    pms: null,
    contrat: null,
    parcelle: null,
    ddp: null,
    espece: null,
    variette: null,
    qsa: null,
    dds: null,
    sfce: null,
    sc: null,
    espece_associe: null,
    variette_associe: null,
    autreEa: null,
    nb_ligne: null,
    long_ligne: null
  };
  private suivi_mep: suivi_mep = {
    ddp: null,
    stc: null,
    ec: null,
    pb: null,
    ex: null,
    controle: null,
    declaration: null,
    img_culte: null
  }
  /**Filtre */
  private selectedAssoc: any;
  private selectedBeneficiare: any;
  private selectedAssocSv: any;// suivi
  private selectedBeneficiareSv: any; // Suivi
  private selectedParcelle: any;
  private filterDataAssoc: any[] = [];
  private filterDataBenef: any[] = [];
  private pmsToFilter: Benef_activ_pms[] = [];
  private filterDataParce: any [];

  /** get Initiale Data */
  private data_association: Loc_association[] = [];
  private data_pms: Benef_activ_pms[] = [];
  private data_saison: Loc_saison[]  = [];
  private data_parcelle_pms: Local_Parcelle[] = [];
  private data_all_contrat_pms: Loc_all_contrat_pms[] = [];
  private data_espece: Loc_Espece[] = [];
  private data_var: Loc_variette[] = [];
  private data_culture: Loc_culture_Pms[] = [];


  private dt_modif: Moment;

  private codeCulture: string;
  private idSuivi: number;

  private isAddSuivi: boolean = false;
  private isEditableSuivi: boolean = false;
  private isEditableCulte: boolean = false;
  private indexRowMep: number;
  private indexRowSuivi: number;
  
  arr:any[] = [];

  // table culture
  private displayedColumns: string[] = ['annee', 'saison', 'association', 'code_pms', 'code_achat', 'nom_pms', 'code_contrat', 'code_parce', 'variette', 'qsa', 'dds', 'sfce', 'sc', 'nb_ligne', 'long_ligne', 'ea', 'action'];
  private displayedColumnsNew: string[] = ['new_annee', 'new_saison', 'new_association', 'new_code_pms', 'new_code_achat', 'new_nom_pms', 'new_code_contrat', 'new_code_parce', 'new_variette', 'new_qsa', 'new_dds', 'new_sfce','new_sc', 'new_nb_ligne', 'new_long_ligne', 'new_ea', 'new_action'];
  private displayedColumnsSuivi: string[] = ['ddp', 'stc', 'ec', 'img_cult', 'ex', 'declaration', 'controle', 'pb', 'action'];
  private displayedNewColumnsSuivi: string[] = ['new_ddp', 'new_stc', 'new_ec', 'new_img_cult', 'new_ex', 'new_declaration', 'new_controle', 'new_pb', 'new_action'];

  private dataSource = new MatTableDataSource<Loc_culture_Pms>();
  private data_all_suivi_mep: Loc_all_suivi_mep[] = [];
  private mepToExport: any[] = [];
  private suiviToExport: any[] = [];

  private data_annee_agricole: Loc_AnneeAgricole[] = [];

  isTableMepExpanded: boolean = false;
  etat_sync: string = SYNC;

  @ViewChild('mepPaginator') mepPaginator: MatPaginator;

  constructor(private plt: Platform,
              private router: Router, 
              private route: ActivatedRoute,
              private loadData: LoadDataService,
              private crudDb: CrudDbService,
              private modalCtrl: ModalController,
              private loadingCtrl: LoadingController,
              private formBuilder: FormBuilder,
              private toastCtrl: ToastController,
              private sharedService: SharedService,
              private dataExport: ExportExcelService,
              private dialog: MatDialog) {
    const routeState = this.router.getCurrentNavigation().extras.state;
    this.loading();
    if (routeState) {
      let zone: any;
      zone = JSON.parse(routeState.zone);
      this.projet = JSON.parse(routeState.projet);
      this.user = JSON.parse(routeState.user);
      this.activite = routeState.activite;

      console.log(zone);
      console.log(this.projet);
      console.log(this.user);

      this.region = zone.data.region;
      this.district = zone.data.district;
      this.commune = zone.data.commune;

      this.loadFktAssociation();
      this.loadSaison();
      this.loadEspece();
      this.loadVariette();
      this.loadAnneeAgricole();

    } else console.log("Router Suivi is not current");
  }
  ngAfterViewInit() {
    this.dataSource.paginator = this.mepPaginator;
  }

  ngOnInit() {}

  ngOnDestroy(): void {
    console.log(":::::Component Suivi function destroy:::::::::::::::::::::::");
    if (this.sharedService.getData() != null) {
      this.sharedService.setData(null);
    }
  }

  /**Event lifeCycle Component */
 /** ionViewWillEnter() {
    console.log("*************************************Life cycle Suivi Componenet::::::::::::::::::::::::");
    //this.refreshDataMep();
  }
  ionViewDidEnter() {
    console.log(":::::LifeCycle Suivi function:::: ionViewDidEnter:::");
    this.loadingCtrl.dismiss();
  }
  ionViewDidLeave(){
    console.log(":::::LifeCycle beneficiare function:::::: ionViewDidLeave:::");
    this.loadingCtrl.dismiss();
  }*/

  async loading() {
    const loading = await this.loadingCtrl.create();
    await loading.present();
  }

  // filtre
  applyFilterSelect(value, source: string) {

    if (source === 'association') {
      if (value != undefined) {
        this.filterDataBenef = [];
        const filterVal = value.code_assoc;
        this.dataSource.filter = filterVal.trim();
  
        this.filterDataBenef = this.pmsToFilter.filter(item => {
          return item.id_association === filterVal;
        });
        this.loadFilterExportAssoc(filterVal);
      }
    } else if (source === 'pms') {
      if (value != undefined) {
        const filterVal = value.code_benef_pms;
        this.dataSource.filter = filterVal.trim();
        this.loadFilterExportPms(filterVal);
      } else {
        const filterVal = this.selectedAssoc.code_assoc;
        this.dataSource.filter = filterVal.trim();
        this.loadFilterExportAssoc(filterVal);
      }
    }
  }
  applyFilterTout(source: string) {
    if (source === 'association') {
      this.dataSource.filter  = '';
      this.dataSource.data = this.data_culture;
      this.filterDataBenef = [];
      this.loadExportMep(this.data_culture);
      this.loadExportSuivi(this.data_all_suivi_mep);
    }
  }
  loadFilterExportAssoc(filtervalue: string) {
    let filterMep: Loc_culture_Pms[] = [];
    let filterSuivi: Loc_all_suivi_mep[] = [];
    // filter value to export
    filterMep = this.data_culture.filter(item => {
      return item.code_ass === filtervalue.trim();
    });
    filterSuivi = this.data_all_suivi_mep.filter(item => {
      return item.code_ass === filtervalue.trim();
    });
    // load data to Export
    this.loadExportMep(filterMep);
    this.loadExportSuivi(filterSuivi);
  }
  loadFilterExportPms(filterV: string) {
    let filterMep: Loc_culture_Pms[] = [];
    let filterSuivi: Loc_all_suivi_mep[] = [];

    filterMep = this.data_culture.filter(item => {
      return item.code_benef_pms === filterV.trim();
    });
    filterSuivi = this.data_all_suivi_mep.filter(item => {
      return item.code_pms === filterV.trim();
    });
    this.loadExportSuivi(filterSuivi);
    this.loadExportMep(filterMep);
  }

  async loadFktAssociation() {

    //const code_com = this.commune.code_com;
    let code_equipe: number;
    this.data_association = [];
    this.filterDataAssoc = [];
    this.data_pms = [];
    this.pmsToFilter = [];
    this.data_culture = [];
    this.data_parcelle_pms = [];
    this.data_all_suivi_mep = [];
    this.data_all_contrat_pms = [];
    this.suiviToExport = [];
    this.dataSource.filter = '';

    let id_commune = {
      code_commune: this.commune.code_com
    }

    this.loadData.loadFokontany(id_commune).then((res_fkt) => {
      console.log(res_fkt);
      if (res_fkt.values.length > 0) {
        res_fkt.values.forEach((elem_fkt, index) => {

          code_equipe = this.user[0].id_equipe;
          const data = {
            id_fkt: elem_fkt.code_fkt,
            code_pr: this.projet.code_proj,
            code_equipe: code_equipe
          }

          this.loadData.loadAssociation(data).then(res_ass => {
            console.log(res_ass);
            if(res_ass.values.length > 0) {
              res_ass.values.forEach((elem_ass: Loc_association) => {
                console.log("+++++ Element Association++++++++");
                this.data_association.push(elem_ass);
                
                this.filterDataAssoc.push({
                  code_assoc: elem_ass.code_ass,
                  nom_assoc : elem_ass.nom_ass
                  });
              });
            }
            // Fin du boucle Fokontany
            if ((res_fkt.values.length - 1) === index) {            
              this.loadMep();
              this.loadPms();
            }
          });
        });
      }
    });
  }

  /************************
   * LOAD MEP
   ************************/
  loadMep() {
    if (this.data_association.length > 0) {
      this.data_all_suivi_mep = [];
      this.data_culture = [];

      this.data_association.forEach((elem_ass, ind_ass) => {
        var id_ass = {
          code_ass: elem_ass.code_ass
        }
        // load Suivi Association
        this.loadData.loadAllSuiviCulture(elem_ass.code_ass).then(res_suivi => {
          console.log("Response load All Suivi::: ",res_suivi.values);

          if (res_suivi.values.length > 0) {
            res_suivi.values.forEach((elem_suivi, i) => {
              // stc
              STC.forEach(elem_stc => {
                if (elem_stc.value === elem_suivi.stc) {
                  elem_suivi.stc_intitule = elem_stc.intitule
                }
              });
              EC_CULTURAL.forEach(elem_ec => {
                if (elem_ec.value === elem_suivi.ec) {
                  elem_suivi.ec_intitule = elem_ec.intitule;
                }
              });
              CONTROLE_MEP.forEach(elem_ctrl => {
                if (elem_ctrl.value === elem_suivi.controle) {
                  elem_suivi.controle_intitule = elem_ctrl.description;
                }
              });
              this.data_all_suivi_mep.push(elem_suivi);
            });
          }
        });
        // load MEP
        this.loadData.loadCulturesPms(id_ass).then(res_cult => {
          if (res_cult.values.length > 0) {
            res_cult.values.forEach((elem_cult, i) => {
              elem_cult.suivi = [];
              this.data_culture.push(elem_cult);
            });
          }
          // Fin du boucle
          if ((this.data_association.length - 1) === ind_ass) {
            this.refreshDataMep();
            this.loadExportMep(this.data_culture);
            this.loadExportSuivi(this.data_all_suivi_mep);
            console.log(":::Etat cultural::::", this.data_culture);
          }
        });
      });
    }
  }
  loadPms() {
    if (this.data_association.length > 0) {
      this.pmsToFilter = [];

      this.data_association.forEach((elem_ass, ind_ass) => {
        var id_ass = {
          code_ass: elem_ass.code_ass
        }
        // load PMS
        this.loadData.loadBeneficiairePmsSaison(elem_ass.code_ass).then(res_pms => {
          console.log("+++++ Response Beneficiaire PMS Saison++++++++");
          console.log(res_pms);
          res_pms.values.forEach((elem_pms: Benef_activ_pms) => {
            this.data_pms.push(elem_pms);
            this.pmsToFilter.push(elem_pms);
          });
        });
        // load Parcelle
        this.loadData.loadParcelle(id_ass).then(res_parce => {
          console.log(res_parce);
          if (res_parce.values.length > 0) {
            res_parce.values.forEach(elem_pms => {
              this.data_parcelle_pms.push(elem_pms);
            });
          }
        });
        // load Contrat pms
        this.loadData.loadAllContratPms(id_ass).then(res_contrat => {
          if (res_contrat.values.length > 0) {
            res_contrat.values.forEach(elem_contrat => {
              this.data_all_contrat_pms.push(elem_contrat);
            });
          }
        });
        // Fin du boucle
        if ((this.data_association.length - 1) === ind_ass) {

        }
      });
    }
  }

  /************************
   * REFRESH DATA SOURCE
   ************************/
  async refreshDataMep() {
    if (this.data_culture.length > 0) {
      this.data_culture.forEach(elem_mep => {
        elem_mep.suivi = this.data_all_suivi_mep.filter(item_suivi => {return item_suivi.id_culture === elem_mep.code_culture});
        if (elem_mep.suivi.length === 0) {
          elem_mep.suivi = [];
        }
      });
    }
    this.dataSource.data = this.data_culture;
    console.log("Refresh:::Datab MEP::::", this.data_culture);
    console.log("Refresh:::Datab MEP::::", this.dataSource.data);
  }

  // load Export Mep
  loadExportMep(mep_pms: Loc_culture_Pms[]) {
    console.log("Data Mep to Export ::", mep_pms);
    this.mepToExport = [];
    if (mep_pms.length > 0) {
      mep_pms.forEach(item => {
        this.mepToExport.push({
          'Annee': item.annee_du + '-' + item.annee_au,
          'Saison': item.saison,
          'Association': item.association,
          'Code PMS': item.code_pms_temp,
          'Code Achat': item.code_achat,
          'Nom': item.prenom != null?item.nom.concat(' ', item.prenom):item.nom,
          'Sexe': item.sexe,
          'Dt nais': item.dt_nais != null?moment(item.dt_nais).format("DD/MM/YYYY"):item.dt_nais_vers,
          'Code Contrat': item.code_contrat_temp,
          'Variete': item.nom_espece + ' ' + item.nom_var,
          'DDP': item.ddp != null?moment(item.ddp).format("DD/MM/YYYY"):item.ddp,
          'QSA': item.qsa,
          'Unité': item.unite_espece,
          'DDS': item.dds != null?moment(item.dds).format("DD/MM/YYYY"):item.dds,
          'Code Parce': item.code_parce_temp,
          'Sfce_reel(m²)': item.superficie,
          'sfce Emblavee(m²)': item.sfce,
          'SC': item.sc,
          'EA': item.ea
        });
      });
    }
  }

  loadExportSuivi(dataToExport: Loc_all_suivi_mep[]) {
    console.log("Data suivi to Exporte ", dataToExport);
    this.suiviToExport = [];
    dataToExport.forEach(elem => {
      // stc
      STC.forEach(elem_stc => {
        if (elem_stc.value === elem.stc) {
          elem.stc_intitule = elem_stc.intitule
        }
      });
      EC_CULTURAL.forEach(elem_ec => {
        if (elem_ec.value === elem.ec) {
          elem.ec_intitule = elem_ec.intitule;
        }
      });
      CONTROLE_MEP.forEach(elem_ctrl => {
        if (elem_ctrl.value === elem.controle) {
          elem.controle_intitule = elem_ctrl.description;
        }
      });
      this.suiviToExport.push({
        Annee: elem.annee_du + '-' + elem.annee_au,
        Saison: elem.saison,
        Association: elem.association,
        "Code PMS": elem.code_pms_temp,
        Code_achat: elem.code_achat,
        Nom: elem.nom,
        Prenom: elem.prenom,
        'Sexe': elem.sexe,
        'Dt Naissance': elem.dt_nais != null?moment(elem.dt_nais, "YYYY-MM-DD").format("DD/MM/YYYY"):elem.dt_nais_vers,
        'Code MEP': elem.id_culture,
        'Code Contrat': elem.code_contrat,
        'Variete': elem.nom_espece + ' ' + elem.nom_var,
        'Code parce': elem.code_parce_temp,
        QSA: elem.qsa,
        'Unité': elem.unite,
        DDS: moment(elem.dds, "YYYY-MM-DD").format("DD/MM/YYYY"),
        "Sfce Emblavée(m²)": elem.sfce,
        DDP: moment(elem.ddp, "YYYY-MM-DD").format("DD/MM/YYYY"),
        STC: elem.stc_intitule,
        EC: elem.ec_intitule,
        PB: elem.pb,
        Estimation: elem.ex,
        'Unité Estimation': elem.unite_estimation,
        Controle: elem.controle_intitule,
        Declaration: elem.declaration
      });
    });
  }

  // load Saison
  loadSaison() {
    this.loadData.loadSaison().then(res_saison => {
      console.log(res_saison);
      if (res_saison.values.length > 0) {
        res_saison.values.forEach(elem_s => {
          this.data_saison.push(elem_s);
        });
      }
    });
  }

  // load Espece
  loadEspece() {
    this.loadData.loadEspece().then(res_Espec => {
      if (res_Espec.values.length > 0) {
        res_Espec.values.forEach(elem_esp => {
          this.data_espece.push(elem_esp);
        });
      }
    });
  }

  // load variette
  loadVariette() {
    this.loadData.loadVariette().then(res_var => {
      console.log(res_var);
      if (res_var.values.length > 0) {
        res_var.values.forEach(elem_var => {
          this.data_var.push(elem_var);
        });
      }
    });
  }
  // 
  loadAnneeAgricole() {
    this.loadData.loadAnneeAgricole().then(res => {
      this.data_annee_agricole = res.values;
    });
  }

  // export excelle
  onExport() {
    let export_data: Loc_export_excel[] = [
      {
        data: this.mepToExport,
        name_feuille: 'MEP',
        name_file: 'PMS_MEP' + '_' + this.user[this.user.length - 1].id_equipe + this.projet.ancronyme
      },
      {
        data: this.suiviToExport,
        name_feuille: 'Suivi',
        name_file: 'PMS_MEP' + '_' + this.user[this.user.length - 1].id_equipe + this.projet.ancronyme
      }
    ];
    this.dataExport.onExport(export_data);
  }

  onUpdate() {
    this.isUpdated = true;
  }
  onAdd() {
    const data = {
      intitule : "add_mep",
    }
    this.presentModal(data);
  }
  onFinish() {
    this.initDataTable();
    this.initFiltre();
  }
  onClickModifElement(index, row) {
    console.log('index ' + index);
    console.log('row ', row);
    const data = {
      intitule : "edit_mep",
      data: row,
      index: index
    }
    this.presentModal(data);
  }
  // on Delete
  async onDeleteMepElement(element) {
    const loading = await this.loadingCtrl.create();
    await loading.present();
    let element_mep: Loc_culture_Pms = element;
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '500px',
      data: {
        elem_mep: element_mep
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result != undefined) {
        if (element_mep.etat_mep === SYNC) {
          let data_suivi: Loc_all_suivi_mep[] = element_mep.suivi;
          let code_mep = {
            code_culture: element_mep.code_culture
          }
          if (data_suivi.length > 0) {
            data_suivi.forEach((elem_suivi, ind_suivi) => {
              let code_suivi_pms = {
                code_suivi: elem_suivi.id
              }
              this.crudDb.deleteSuiviPms(code_suivi_pms);
              
              if ((data_suivi.length - 1) === ind_suivi) {
                this.crudDb.deleteMepPms(code_mep).then(res => {
                  console.log("::::MEP Deleted::::", res.changes);
                  this.loadMep();
                  this.loadingCtrl.dismiss();
                });
              }
            });
          } else {
            this.crudDb.deleteMepPms(code_mep).then(res => {
              console.log("::::MEP Deleted::::", res.changes);
              this.loadMep();
              this.loadingCtrl.dismiss();
            });
          }
        }
      } else this.loadingCtrl.dismiss();
    });
  }
  async onDeleteSuiviElement(element) {
    const loading = await this.loadingCtrl.create();
    await loading.present();
    let element_suivi: Loc_all_suivi_mep = element;
    console.log(":::Element suivi::::", element_suivi);
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '400px',
      data: {
        elem_suivi: element_suivi
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      
      if (result != undefined) {
        if (element_suivi.etat_suivi === SYNC) {
          let code_suivi_pms = {
            code_suivi: element_suivi.id
          }
          this.crudDb.deleteSuiviPms(code_suivi_pms).then(res => {
            console.log(":::Suivi Deleted::::", res.changes);
            this.loadMep();
            this.loadingCtrl.dismiss();
          });
        }
      } else this.loadingCtrl.dismiss();
    });
  }

  /*********************************************************
   * Save Action Update(Add, update) TB Mise en Place Semences
   *********************************************************/
   // Edit Table
  async onClickEditDoneAction(data_row: any) {
    const loading = await this.loadingCtrl.create();
    await loading.present();
    if (data_row.table === 'culture') {
      let element_row: Loc_culture_Pms = data_row.element_mep;
      const  editCulte: Db_Culture_pms = {
        code_culture: element_row.code_culture,
        id_contrat: this.mep_culte.contrat.code,
        id_parce: this.mep_culte.parcelle != null ? this.mep_culte.parcelle.code_parce : null,
        id_var: this.mep_culte.variette != null ? this.mep_culte.variette.code_var : null,
        id_saison: this.mep_culte.saison != null ? this.mep_culte.saison.code_saison : null,
        id_annee: this.mep_culte.annee != null ? this.mep_culte.annee.code : null,
        ddp: this.mep_culte.ddp,
        dt_creation: element_row.dt_creation,
        dt_modification: moment().format("YYYY-MM-DD"),
        qsa: this.mep_culte.qsa,
        img_fact: null,
        dds: this.mep_culte.dds,
        sfce: this.mep_culte.sfce,
        sc: this.mep_culte.sc != null ? this.mep_culte.sc.value : null,
        ea_id_variette: this.mep_culte.variette_associe != null ? this.mep_culte.variette_associe.code_var : null,
        ea_autres: this.mep_culte.autreEa,
        statuts: EC,
        Etat: element_row.etat_mep === SYNC ? SYNC : UPDATE,
        nb_ligne: this.mep_culte.nb_ligne,
        long_ligne: this.mep_culte.long_ligne
      }
      this.crudDb.UpdatedCulture(editCulte).then(res => {
        this.isEditableCulte = false;
        this.indexRowMep = null;
        this.mep_culte = <Mep_Add>{};
        setTimeout(() => {
          this.loadMep();
          this.loadingCtrl.dismiss();
        }, 200);
      });
    }
   }
   onClickEditCancelAction(table) {
    if (table === 'culture') {
      this.mep_culte = <Mep_Add>{};
      this.isEditableCulte = false;
      this.indexRowMep = null;
    }
   }
   /** Add new Elem */
  async onClickDoneAction() {
    const loading = await this.loadingCtrl.create();
    await loading.present();
    let data_culture_assoc: Loc_culture_Pms[] = [];
    let latestIdCulture: string;
    let order: number = 1;

    const id_ass = {
      code_ass: this.mep_culte.association != null?this.mep_culte.association.code_ass:null,
      id_annee: this.mep_culte.annee != null?this.mep_culte.annee.code:null
    }
    this.loadData.loadCulturesPms(id_ass).then(res_cult => {
      console.log(res_cult);
      if (res_cult.values.length > 0) {
        res_cult.values.forEach(elem_cult => {
          data_culture_assoc.push(elem_cult);
        });
      }
      console.log(data_culture_assoc);

      // get latestId Culture association
      if (data_culture_assoc.length > 0) {
        console.log("latest Id***************");
        data_culture_assoc.forEach((elem, i) => {
          if ((data_culture_assoc.length - 1) === i) {
            console.log(elem)
            latestIdCulture = elem.code_culture;
          }
        });
        // extract latestId
        let arr_latestIdCult = latestIdCulture.trim().split("-");
        arr_latestIdCult.forEach((elem, i) => {
          if ((arr_latestIdCult.length - 1) === i) {
            console.log(elem)
            order = parseInt(elem) + 1;
            console.log("Order:::", order);
          }
        });
      }
      let annee_saison = this.mep_culte.annee.annee_du.toString().charAt(2) + this.mep_culte.annee.annee_du.toString().charAt(3) + this.mep_culte.annee.annee_au.toString().charAt(2) + this.mep_culte.annee.annee_au.toString().charAt(3);
      this.codeCulture = this.mep_culte.association.numero + this.mep_culte.association.ancronyme + annee_saison + '-' + moment().format('YYYYMMDD-HHmmss');

      // Insert new Culture
      const  dataNewCulteToInsert: Db_Culture_pms = {
        code_culture: this.codeCulture,
        id_contrat: this.mep_culte.contrat.code,
        id_parce: this.mep_culte.parcelle != null ? this.mep_culte.parcelle.code_parce : null,
        id_var: this.mep_culte.variette != null ? this.mep_culte.variette.code_var : null,
        id_saison: this.mep_culte.saison != null ? this.mep_culte.saison.code_saison : null,
        id_annee: this.mep_culte.annee != null ? this.mep_culte.annee.code : null,
        ddp: this.mep_culte.ddp,
        dt_creation: moment().format("YYYY-MM-DD"),
        dt_modification: moment().format("YYYY-MM-DD"),
        qsa: this.mep_culte.qsa,
        img_fact: null,
        dds: this.mep_culte.dds,
        sfce: this.mep_culte.sfce,
        sc: this.mep_culte.sc != null ? this.mep_culte.sc.value : null,
        ea_id_variette: this.mep_culte.variette_associe != null ? this.mep_culte.variette_associe.code_var : null,
        ea_autres: this.mep_culte.autreEa,
        statuts: EC,
        Etat: SYNC,
        nb_ligne: this.mep_culte.nb_ligne,
        long_ligne: this.mep_culte.long_ligne
      }
      console.log(dataNewCulteToInsert);
      this.crudDb.AddNewCulture(dataNewCulteToInsert).then(res => {
        setTimeout(()=> {
          this.mep_culte = <Mep_Add>{};
          this.isAddMep = false;
          this.loadMep();
          this.loadingCtrl.dismiss();
        }, 200);
      });
    }); 
  }
  onClickCancelAction() {
    this.mep_culte = <Mep_Add>{};
    this.isAddMep = false;
  }
  // Modal Data
  async presentModal(data_: any) {
    console.log(data_)
    let modal: any;
    if (data_.intitule == 'add_mep') {
      modal = await this.modalCtrl.create({
        component: ModalPage,
        cssClass: 'my-custom-modal-suivi',
        backdropDismiss: false,
        componentProps: {
          isSuiviRp: true,
          association: this.data_association,
          saison: this.data_saison,
          pms: this.data_pms,
          contrat: this.data_all_contrat_pms,
          parcelle: this.data_parcelle_pms,
          espece: this.data_espece,
          variette: this.data_var,
          annee_agricole: this.data_annee_agricole
        }
      })
    } else if (data_.intitule === 'add_suivi') {
      modal = await this.modalCtrl.create({
        component: ModalPage,
        cssClass: 'my-custom-modal-suivi',
        backdropDismiss: false,
        componentProps: {
          isSuiviMepRp: true,
          isAddSuiviMep: true,
          element_mep: data_.element_mep,
          espece: this.data_espece,
          variette: this.data_var
        }
      });
    } else if(data_.intitule == 'edit_mep') {
      modal = await this.modalCtrl.create({
        component: ModalPage,
        cssClass: 'my-custom-modal-suivi',
        backdropDismiss: false,
        componentProps: {
          isSuiviRp: true,
          association: this.data_association,
          saison: this.data_saison,
          pms: this.data_pms,
          contrat: this.data_all_contrat_pms,
          parcelle: this.data_parcelle_pms,
          espece: this.data_espece,
          variette: this.data_var,
          annee_agricole: this.data_annee_agricole,
          data_edit: data_.data
        }
      })
    } else if (data_.intitule == 'edit_suivi') {
      modal = await this.modalCtrl.create({
        component: ModalPage,
        cssClass: 'my-custom-modal-suivi',
        backdropDismiss: false,
        componentProps: {
          isSuiviMepRp: true,
          isEditSuiviMep: true,
          element_mep: data_.element_mep,
          element_suivi: data_.element_suivi,
          espece: this.data_espece,
          variette: this.data_var
        }
      });
    }
    // dismissed
    modal.onDidDismiss().then((data_modal) => {
      console.log("*** Modal Suivi dismissed ****");
      console.log(data_modal);
      if (data_modal.data != undefined) {
        
        // Mep
        if (data_.intitule == 'add_mep' || data_.intitule == 'edit_mep') {
          this.mep_culte = data_modal.data;

          this.mep_culte.ddp = this.mep_culte.ddp != null?data_modal.data.ddp.format("YYYY-MM-DD"):null;
          this.mep_culte.dds = this.mep_culte.dds != null?data_modal.data.dds.format("YYYY-MM-DD"):null;
          if (data_.intitule == 'add_mep') {
            this.isAddMep = true;
          } else if (data_.intitule == 'edit_mep') {
            console.log("**Edit suivi dismissed");
            this.isEditableCulte = true;
            this.indexRowMep = data_.index;
          }
        }
        // Suivi
        if (data_.intitule === 'add_suivi' || data_.intitule === 'edit_suivi') {
          this.suivi_mep = data_modal.data;
          //
          this.suivi_mep.ddp = this.suivi_mep.ddp != null?data_modal.data.ddp.format("YYYY-MM-DD"):null;

          if (data_.intitule === 'add_suivi') {
            this.isAddSuivi = true;
            this.indexRowMep = data_.index_mep;
          } else if(data_.intitule === 'edit_suivi') {
            this.isEditableSuivi = true;
            this.indexRowMep = data_.index_mep;
            this.indexRowSuivi = data_.index_suivi;
          }
        }
      }
    });
    await modal.present();
  }


  /**
   * ***************************************************
   * SUIVI MEP CULTURE
   * ************************************************************/
  onUpdateSuivi(data: any) {
    // onUpdateSuivi({action: 'add_suivi', element_mep: element_mep, index_mep: ind_mep});
    let data_: any;
    if (data.action === 'add_suivi') {
      data_ = {
        intitule: data.action,
        element_mep: data.element_mep, 
        index_mep: data.index_mep
      }
    } else if (data.action === 'edit_suivi') {
      // {action: 'edit_suivi', element_mep: element_mep, element_suivi: row, index_mep: ind_mep, index_suivi: i}
      data_ = {
        intitule: data.action,
        element_mep: data.element_mep,
        element_suivi: data.element_suivi,
        index_mep: data.index_mep,
        index_suivi: data.index_suivi
      }
    }

    this.presentModal(data_);
  }

  onCancelSaveSuivi(src: string) {
    if (src === 'add_suivi') {
      this.isAddSuivi = false;
      this.indexRowMep = null;
      this.suivi_mep = <suivi_mep>{};
    } else if(src === 'edit_suivi') {
      this.isEditableSuivi = false;
      this.indexRowMep = null;
      this.indexRowSuivi = null;
      this.suivi_mep = <suivi_mep>{};
    }
  }
  async onSaveSuivi(data_row: any) {
    const loading = await this.loadingCtrl.create();
    await loading.present();
    console.log("***Add Suivi*********");
    let order: number = 1;
    let elem_mep: Loc_culture_Pms = data_row.element_mep;
    let update_suivi: Db_suivi_pms = {
      id: null,
      code_culture: null,
      ddp: this.suivi_mep.ddp,
      stc: this.suivi_mep.stc != null? this.suivi_mep.stc.value:null,
      ec: this.suivi_mep.ec != null? this.suivi_mep.ec.value:null,
      pb: this.suivi_mep.pb,
      ex: this.suivi_mep.ex,
      img_cult: this.suivi_mep.img_culte,
      name: null,
      path: null,
      controle: this.suivi_mep.controle != null?this.suivi_mep.controle.value:null,
      declaration: this.suivi_mep.declaration != null?this.suivi_mep.declaration.value:null,
      etat: SYNC
    }
    if (data_row.action === 'add_suivi') {
      //{action: 'add_suivi', element_mep: element_mep} 

      update_suivi.id = this.user[this.user.length - 1].id_equipe+ this.projet.ancronyme + '-' + 'SV-' + moment().format('YYYYMMDDHHmmss');// Refaire
      update_suivi.code_culture = elem_mep.code_culture;

      this.crudDb.AddNewSuivi(update_suivi).then(async res => {
        this.loadMep();
        this.isAddSuivi = false;
        this.indexRowMep = null;
        this.suivi_mep = <suivi_mep>{};
        this.loadingCtrl.dismiss();
      });
    } else if (data_row.action === 'edit_suivi') {
      // {action: 'edit_suivi', element_mep: element_mep, elem_suivi: row}
      let elem_suivi: Loc_all_suivi_mep = data_row.elem_suivi;
      update_suivi.id = elem_suivi.id;
      update_suivi.code_culture = elem_suivi.id_culture;

      this.crudDb.UpdatedSuivi(update_suivi).then(res => {
        this.loadMep();
        this.isEditableSuivi = false;
        this.indexRowMep = null;
        this.indexRowSuivi = null;
        this.suivi_mep = <suivi_mep>{};
        this.loadingCtrl.dismiss();
      });
    }
  }

  onToggleTableRows() {
    this.isTableMepExpanded = !this.isTableMepExpanded;
    this.dataSource.data.forEach((row: Loc_culture_Pms) => {
      if (row.suivi.length > 0) {
        row.isExpanded = this.isTableMepExpanded;
      } else {
        if (row.isExpanded) {
          row.isExpanded = false;
        }
      }
    });
  }

  // generer code Culture
  generateCodeCulte() {

  }
  compareObjectsEc(ec1: any, ec2: any) {
    console.log(ec1);
    console.log(ec2);
    return ec1 && ec2? ec1.value === ec2.value : ec2 === ec2;
  }

  // Modal modifcation Zone
  async modificationZone() {
    const modal = await this.modalCtrl.create({
      component: ModalPage,
      componentProps: {
        'isModificationZone': true,
        'activite': this.activite
      }
    });
    modal.onDidDismiss().then(async (data_dism) => {
      const loading = await this.loadingCtrl.create();
      await loading.present();
      console.log(data_dism);
      if (data_dism.data != undefined) {
        console.log("***Modal Data***", data_dism);
        this.sharedService.setData(data_dism);
        this.region = data_dism.data.region;
        this.district = data_dism.data.district;
        this.commune = data_dism.data.commune;
        this.loadFktAssociation();
        // Initialized
        this.onFinish();

        setTimeout(() => {
          this.dataSource.data = this.data_culture;
          // init suivi
          //this.refreshTbSuivi();
          this.loadingCtrl.dismiss();
        }, 1000);
      }
    });
    await modal.present();
  }

  initFiltre() {
    // init mep
    this.dataSource.filter = '';
    this.dataSource.data = this.data_culture;
    // init suivi
    this.selectedAssoc = null;
    this.selectedBeneficiare = null;
    this.selectedAssocSv = null;
    this.selectedBeneficiareSv = null;
    this.loadExportMep(this.data_culture);
    this.loadExportSuivi(this.data_all_suivi_mep);
  }

  initDataTable() {
    if (this.isUpdated) {
      this.isEditableCulte = false;
      this.isAddMep = false;
      this.indexRowMep = null;
      this.mep_culte = <Mep_Add>{};
      this.isEditableSuivi = false;
      this.isAddSuivi = false;
      this.indexRowSuivi = null;
      this.isUpdated = false;
    }
    this.refreshDataMep();
    // loadExport
  }

  // Little helper
  async presentToast(text) {
    const toast = await this.toastCtrl.create({
      message: text,
      duration: 3000,
    });
    toast.present();
  }
  onClick() {
    this.router.navigate(['homes']);
  }
}

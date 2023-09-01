import { animate, state, style, transition, trigger } from '@angular/animations';
import { AfterViewInit, Component, OnInit, Output, EventEmitter, SimpleChanges, ViewChild, OnDestroy } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
// Imports 
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingController, ModalController } from '@ionic/angular';
import { Loc_association, Benef_activ_pms, Local_Parcelle, Loc_projet, Loc_district, Loc_Commune, Loc_Fokontany, Loc_region, Update_infos_benef, Loc_activ_projet, Loc_Collabo_Activite, Loc_Parce_saison, Loc_AnneeAgricole, Loc_saison, Loc_Espece, Loc_variette, Loc_categEspece, Update_Form_ParceSaison, Generate_code_contrat_pms, Generate_code_assoc_parce, Loc_export_excel, Generate_code_pms, Find_suivi_MEP_pms, Find_mep_contrat_pms, Find_contrat_pms } from 'src/app/interfaces/interfaces-local';
import { LoadDataService } from 'src/app/services/local/load-data.service';
import { SharedService } from 'src/app/services/shared.service';
import { Utilisateurs } from 'src/app/utils/interface-bd';
import { ModalPage } from '../modal/modal.page';
import { ModalPrPage } from '../modals/modal-pr/modal-pr.page';

import * as _moment from 'moment';
import { ACTIVE, SYNC, UPDATE, VALIDE} from 'src/app/utils/global-variables';
import { UpdateBenef, UpdatedBenefActivPms, UpdateParcellePms, UpdateParceSaisonPms } from 'src/app/interfaces/interface-insertDb';
import { CrudDbService } from 'src/app/services/local/crud-db.service';
import { ExportExcelService } from 'src/app/services/export-excel.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from 'src/app/component/dialog/dialog.component';
import { VisualiseurImagePage } from '../modals/visualiseur-image/visualiseur-image.page';
const moment = _moment;

export interface UserData {
  id: string;
  nom: string;
  fokontany: string;
}

@Component({
  selector: 'app-beneficiaire',
  templateUrl: './beneficiaire.page.html',
  styleUrls: ['./beneficiaire.page.scss'],
  animations: [ //utiliser pour @detailExpand (table expendable)
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ])
  ]
})
export class BeneficiairePage implements OnInit, AfterViewInit, OnDestroy {

  displayedColumnsBenef: string[] = ['association', 'fokontany', 'code_pms', 'code_ahat', 'pms', 'sexe', 'age', 'cin', 'img_cin', 'village', 'collaborateur', 'action'];
  displayedColumnsAddBenef: string[] = ['new_association', 'new_fokontany', 'new_code_pms', 'new_code_ahat', 'new_pms', 'new_sexe', 'new_age', 'new_cin', 'new_img_cin', 'new_village', 'new_collaborateur', 'new_action'];
  displayedColumns: string[] = ['fokontany', 'association', 'nb_pms', 'code_benef', 'pa', 'sexe', 'cin', 'surnom', 'technicien'];
  displayedColumnsParce: string[] = ['association', 'annee', 'saison', 'num_contrat', 'code_pms', 'code_achat', 'nom', 'dt_naissance', 'sexe', 'cin', 'variette', 'objectif', 'code_parce', 'lat', 'log', 'superficie', 'fokontany'];
  displayedColumnsParcePms: string[] = ['num_contrat', 'annee', 'saison', 'variette', 'objectif', 'code_parce', 'ref_gps', 'lat', 'log', 'superficie', 'commune', 'adresse', 'action'];
  displayedColumnsAddParcePms: string[] = ['new_num_contrat', 'new_annee', 'new_saison', 'new_variette', 'new_objectif', 'new_code_parce', 'new_ref_gps', 'new_lat', 'new_log', 'new_superficie', 'new_commune', 'new_adresse', 'new_action'];

  filterData: Loc_association[] = [];
  filterDataParce: Local_Parcelle[] = [];
  data_pms: Benef_activ_pms[] = [];
  parcelle_pms: Local_Parcelle[] = [];
  parcelle_saison_pms: Loc_Parce_saison[] = [];
  nb_parce_ass_filter: number = 0;
  association: Loc_association[] = []; 
  expandedElement: Benef_activ_pms | null;
  selectedAssocPms: Loc_association;
  selectedAssocContrat: Loc_association;
  isFiltered: boolean = false;
  dataSource = new MatTableDataSource<Loc_association>();
  dataSourceBenef = new MatTableDataSource<Benef_activ_pms>();
  dataSourceParce = new MatTableDataSource<Loc_Parce_saison>();

  data_assoc_filter: Loc_association[] = [];

  private update_pms: Update_infos_benef = {
    img_pr: null,
    nom: null,
    prenom: null,
    surnom: null,
    sexe: null,
    dt_naissance: null,
    dt_naissance_vers: null,
    cin: null,
    img_cin_1: null,
    img_cin_2: null,
    dt_delivrance: null,
    lieu_delivrance: null,
    code_achat: null,
    contact: null,
    region: null,
    district: null,
    commune: null,
    fokontany: null,
    village: null,
    association: null,
    collaborateur: null,
    bloc: null
  };

  private update_parce_pms: Update_Form_ParceSaison = <Update_Form_ParceSaison>{}

  isUpdate: boolean = false;
  isAddPms: boolean = false;
  isEditRowPms: boolean = false;

  indexEditRowPms: number;
  isTablePRExpanded: boolean = false;

  isAddParce: boolean = false;
  isRowEditParce: boolean = false;
  indexEditRowParce: number;

  data_region: Loc_region[] = [];
  data_district: Loc_district[] = [];
  data_commune: Loc_Commune[] = [];
  data_fokontany: Loc_Fokontany[] = [];

  data_collaborateur: Loc_Collabo_Activite[] = [];
  data_annee_agricole: Loc_AnneeAgricole[] = [];
  data_saison: Loc_saison[]  = [];
  data_espece: Loc_Espece[] = [];
  data_var: Loc_variette[] = [];
  data_categ: Loc_categEspece[] = [];

  data_pms_export: any[] = [];
  data_contrat_export: any[] = [];
  data_annee_filter: Loc_AnneeAgricole[] = [];
  selectedAnnee: Loc_AnneeAgricole;
  


  // Association Paginator
  @ViewChild('assocPaginator') assocPaginator: MatPaginator;
  @ViewChild('assocSort') assocSort: MatSort;

  // Beneficiaire pms Paginator
  @ViewChild('benfPaginator') benfPaginator: MatPaginator;
  //@ViewChild('benefSort') benefSort: MatSort;

  // Parcelle pms
  @ViewChild('parcePaginator') parcePaginator: MatPaginator;
  @ViewChild('parceSort') parceSort: MatSort;

  @Output('zone_benef') zone: EventEmitter<any> = new EventEmitter();

  region: any;
  district: any;
  commune: any;
  projet: Loc_projet;
  user: Utilisateurs[];
  activite: Loc_activ_projet;
  isRouterActive: boolean = false;

  etat_sync = SYNC;
  etat_valide = VALIDE;
  etat_update = UPDATE;

  constructor(
              public modalCtrl: ModalController, 
              private router: Router, 
              private loadData: LoadDataService,
              private loadingCtrl: LoadingController,
              private route: ActivatedRoute,
              private sharedService: SharedService,
              private crudService: CrudDbService,
              private dataExport: ExportExcelService,
              private dialog: MatDialog) {
    //this.loading();
    const routeState = this.router.getCurrentNavigation().extras.state;
    console.log(":::::CONSTRUCTEUR Beneficiaire::::::::::::::::::::::::", routeState);
    if (routeState) {
      console.log(":::::CONSTRUCTEUR Beneficiaire::::::::::::::::::::::::")
      let data: any;
      let projet: Loc_projet;
      
      data = JSON.parse(routeState.zone);
      projet = JSON.parse(routeState.projet);
      this.user = JSON.parse(routeState.user);
      this.activite = routeState.activite;
      ///this.region = JSON.parse(data.data);
      console.log("Beneficiaire RP=====>");

      this.region = data.data.region;
      this.district = data.data.district;
      this.commune = data.data.commune;
      this.projet = projet;
      this.loadFktAssociation();
      this.isRouterActive = true;

    } else console.log("router Beneficiaire is not current");
  }
  ngOnDestroy(): void {
    console.log(":::::Component beneficiare function destroy:::::::::::::::::::::::");
    if (this.sharedService.getData() != null) {
      this.sharedService.setData(null);
    }
  }

  ngOnInit() {
    this.loadZone();
    this.loadCollaborateur();
    this.loadDataInitial();
  }

  ngAfterViewInit() {
    console.log(":::::Component beneficiare function AfterViewInit:::::::::::::::::::::::");
    this.assocSort.disableClear = true;
    this.dataSource.paginator = this.assocPaginator;
    this.dataSource.sort = this.assocSort;

    //this.benefSort.disableClear = true;
    this.dataSourceBenef.paginator = this.benfPaginator;
    //this.dataSourceBenef.sort = this.benefSort;

    this.dataSourceParce.paginator = this.parcePaginator;
    this.dataSourceParce.sort = this.parceSort;
  }
  /** Navigation LifeCycle event component */

  ionViewWillEnter()  {
    console.log(":::::LifeCycle Beneficiaire function:::: ionViewWillEnter:::");
  }
  ionViewDidEnter() {
    console.log(":::::LifeCycle Beneficiaire function:::: ionViewDidEnter:::");
    setTimeout(() => {
      this.initPropr();
      this.dataSource.filter = '';
      this.dataSourceBenef.filter = '';    
      this.dataSourceParce.filter  = '';
      this.refreshDataSource();
      //this.loadingCtrl.dismiss();
    }, 1000);
  }
  ionViewDidLeave(){
    console.log(":::::LifeCycle beneficiare function:::::: ionViewDidLeave:::");
    //this.isRouterActive = false;
    this.loadingCtrl.dismiss();
  }
  ionViewWillUnload() {
    console.log(":::::LifeCycle beneficiare function:::::: ionViewWillUnload:::");
  }

  async loading() {
    const loading = await this.loadingCtrl.create();
    await loading.present();
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  applyFilterSelect(value, table: string) {
    console.log(value);
    if (value != undefined) {

      if (table === 'pms') {
        const filterValue: Loc_association = value;
        let filter_pms = this.data_pms.filter(item_pms => {return item_pms.id_association === filterValue.code_ass});
        let filter_contrat = this.parcelle_saison_pms.filter(item_contrat => {return item_contrat.code_ass === filterValue.code_ass});

        this.loadExportPms(filter_pms);
        this.loadExportContrat(filter_contrat);

        this.dataSourceBenef.data = filter_pms;
      } else if (table === 'contrat') {
        const filterValue: Loc_association = value;
        this.selectedAnnee = <Loc_AnneeAgricole>{};
        let filter_parce = this.parcelle_saison_pms.filter(item_contrat => {return item_contrat.code_ass === filterValue.code_ass});

        filter_parce.forEach(elem_ct => {
          let verif_annee = this.data_annee_filter.filter(item_annee_f => {return item_annee_f.code === elem_ct.id_annee});
          if (verif_annee.length === 0) {
            let annee = this.data_annee_agricole.filter(item_annee => {return item_annee.code === elem_ct.id_annee});
            if (annee.length > 0) {
              this.data_annee_filter.push(annee[0]);
            }
          }
        });
        this.loadExportContrat(filter_parce);
        this.dataSourceParce.data  = filter_parce;
      } else if (table === "annee_contrat") {
        const filter_annnee: Loc_AnneeAgricole = value;
        let filter_contrat = this.parcelle_saison_pms.filter(item_contrat => {return item_contrat.code_ass === this.selectedAssocContrat.code_ass && item_contrat.id_annee === filter_annnee.code});

        this.loadExportContrat(filter_contrat);
        this.dataSourceParce.data  = filter_contrat;
      }
    }
  }

  applyFilterTout(table: string) {
    if (table === 'pms') {
      this.loadExportPms(this.data_pms);
      this.loadExportContrat(this.parcelle_saison_pms);

      this.dataSourceBenef.data =  this.data_pms;
    } else if (table === 'contrat') {
      this.data_annee_filter = [];
      this.selectedAnnee = <Loc_AnneeAgricole>{};
      this.selectedAssocContrat = <Loc_association>{};
      
      this.loadExportContrat(this.parcelle_saison_pms);
      this.dataSourceParce.data = this.parcelle_saison_pms;
    } else if (table === 'annee_contrat') {
      let filter_parce = this.parcelle_saison_pms.filter(item_contrat => {return item_contrat.code_ass === this.selectedAssocContrat.code_ass});
      this.loadExportContrat(filter_parce);
      this.dataSourceParce.data  = filter_parce;
    }
  }

  loadFktAssociation() {
    let fokontany: Loc_Fokontany[] = [];
    this.dataSource.data = [];
    this.dataSourceBenef.data = [];

    this.association = [];
    this.data_assoc_filter = [];

    console.log(this.commune);
    let id_commune = {
      code_commune: this.commune.code_com
    }
    this.loadData.loadFokontany(id_commune).then((res) => {
      console.log(res.values);
      fokontany = res.values;
      if (fokontany.length > 0) {
        fokontany.forEach((elements, ind_fkt) => {
          console.log(this.projet);

          const data = {
            id_fkt: elements.code_fkt,
            code_pr: this.projet.code_proj,
            code_equipe: this.user[0].id_equipe
          }
          this.loadData.loadAssociation(data).then((res_assoc) => {
            console.log(":::Association Fokontany:::", res_assoc);
            if (res_assoc.values.length > 0) {
              res_assoc.values.forEach(elem => {
                this.association.push({
                  numero: elem.numero,
                  id_prjt: elem.id_prjt,
                  code_proj: elem.code_proj, 
                  nom_pr: elem.nom_pr, 
                  id_fkt:  elem.id_fkt, 
                  nom_fkt: elem.nom_fkt,
                  code_ass: elem.code_ass, 
                  nom_ass: elem.nom_ass,
                  ancronyme: elem.ancronyme,
                  id_tech: elem.id_tech, 
                  technicien: elem.technicien,
                  nb_benef: elem.nb_benef, 
                  nom_pa: elem.nom_pa,
                  prenom: elem.prenom,
                  sexe: elem.sexe,
                  cin: elem.cin,
                  dt_delivrance: elem.dt_delivrance,
                  lieu_delivrance: elem.lieu_delivrance,
                  img_benef: elem.img_benef,
                  surnom: elem.surnom,
                  status: elem.status
                });
                this.data_assoc_filter.push(elem);
              });
            }
            
            //fin du boucle
            if ((fokontany.length - 1) === ind_fkt) {
              console.log("****Dernier boucle fkt***");
              this.loadPmsAsso();
            }
          });    
        });
      }
    });

  }

  loadPmsAsso() {
    console.log(":::Load Data Pms:::");
    this.data_pms = [];
    this.parcelle_saison_pms = [];
    if (this.association.length > 0 ) {
      this.association.forEach(((elem_assoc, ind_assoc) => {
        const data_pms = {
          code_ass: elem_assoc.code_ass
        }
        const data_parce = {
          code_ass: elem_assoc.code_ass,
          code_prj: this.projet.code_proj
        }
        this.loadData.loadParcelleSaison(data_parce).then(res_parce => {
          if (res_parce.values.length > 0) {
            res_parce.values.forEach(elem_parce => {
              this.parcelle_saison_pms.push(elem_parce);
            });
          }
        });
        this.loadData.loadBeneficiairePms({code_ass: elem_assoc.code_ass}).then((res_pms) => {
          if (res_pms.values.length > 0) {
            res_pms.values.forEach((elem_pms: Benef_activ_pms) => {
              elem_pms.parcelle = [];
              this.data_pms.push(elem_pms);
            });
          }
          /********************
          * Fin du boucle
          *********************/
          if ((this.association.length - 1) === ind_assoc) {
            // refresh data source
            this.refreshDataSource();
          }
        });
      }));
    }
  }
  refreshDataSource() {
    if (this.data_pms.length > 0) {
      this.data_pms.forEach(elem_pms => {
        if (this.parcelle_saison_pms.length > 0) {
          elem_pms.parcelle = this.parcelle_saison_pms.filter(item_parce => {return item_parce.id_pms === elem_pms.code_benef_pms});
        } else elem_pms.parcelle = [];
      });
      this.loadExportPms(this.data_pms);
      this.loadExportContrat(this.parcelle_saison_pms);
    }
    this.dataSourceParce.data = this.parcelle_saison_pms;
    this.dataSourceBenef.data = this.data_pms;
    this.dataSource.data = this.association;
    console.log(":::Data Contrat:::::", this.parcelle_saison_pms);
  }
  // Exporter 
  onExport(src: string) {
    console.log("Exporter.....");
    if (src === 'pms') {
      let export_pms: Loc_export_excel[] = [
        {
          data: this.data_pms_export,
          name_feuille: 'PMS',
          name_file: 'PMS_' + this.projet.ancronyme + '-' + this.user[0].id_equipe + this.user[0].nom + this.user[0].prenom
        },
        {
          data: this.data_contrat_export,
          name_feuille: 'Contrat',
          name_file: 'PMS_' + this.projet.ancronyme + '-' + this.user[0].id_equipe + this.user[0].nom + this.user[0].prenom
        }
      ]
      this.dataExport.onExport(export_pms);
    } else if (src === "contrat") {
      let export_contrat: Loc_export_excel[] = [
        {
          data: this.data_contrat_export,
          name_feuille: 'Contrat',
          name_file: 'PMS_Contrat' + this.projet.ancronyme + '-' + this.user[0].id_equipe + this.user[0].nom + this.user[0].prenom
        }
      ];
      this.dataExport.onExport(export_contrat);
    }
  }

  /*******************************
   * EXPORT PMS
   *******************************/
  loadExportPms(export_pms: Benef_activ_pms[]) {
    this.data_pms_export = [];
    if (export_pms.length > 0) {
      export_pms.forEach(elem_pms => {
        this.data_pms_export.push({
          'Localité_association': elem_pms.fkt_association,
          'Association': elem_pms.nom_ass,
          'Code_PMS': elem_pms.code_pms_temp,
          'Code Achat': elem_pms.code_achat,
          'Nom': elem_pms.prenom != null?elem_pms.nom_benef.concat(' ', elem_pms.prenom):null,
          'Surnom': elem_pms.surnom,
          'Dt Nais': elem_pms.dt_nais != null?moment(elem_pms.dt_nais).format("DD/MM/YYYY"):elem_pms.dt_nais_vers,
          'Sexe': elem_pms.sexe,
          'CIN': elem_pms.cin,
          'Dt délivrance': elem_pms.dt_delivrance != null?moment(elem_pms.dt_delivrance).format("DD/MM/YYYY"):null,
          'Lieu délivrance': elem_pms.lieu_delivrance,
          'contact': elem_pms.contact,
          'Commune': elem_pms.nom_commune,
          'Fokontany': elem_pms.adress
        });
      });
    }
  }
  loadExportContrat(export_contrat: Loc_Parce_saison[]) {
    this.data_contrat_export = [];
    if (export_contrat.length > 0) {
      export_contrat.forEach(elem_contrat => {
        this.data_contrat_export.push({
          'Association': elem_contrat.association,
          'Annee': elem_contrat.annee_du + '-' + elem_contrat.annee_au,
          'Saison': elem_contrat.saison,
          'N°Contrat': elem_contrat.code_contrat,
          'Code pms': elem_contrat.code_pms_temp,
          'Code_Achat': elem_contrat.code_achat,
          'Nom': elem_contrat.prenom != null?elem_contrat.nom.concat(' ', elem_contrat.prenom):elem_contrat.nom,
          'Dt Nais': elem_contrat.dt_nais != null?moment(elem_contrat.dt_nais).format("DD/MM/YYYY"):elem_contrat.dt_nais_vers,
          'Sexe': elem_contrat.sexe,
          'CIN': elem_contrat.cin,
          'Variette': elem_contrat.variette,
          'Objectif': elem_contrat.objectif,
          'Unité': elem_contrat.unite_objectif,
          'Code parce': elem_contrat.code_parce_temp,
          'Lat': elem_contrat.latitude,
          'Log': elem_contrat.logitude,
          'Sfce(m²)': elem_contrat.superficie,
          'Parce_Commune': elem_contrat.nom_commune,
          'Parce_Fokontany': elem_contrat.fokontany_prc
        });
      });
    }
  }

  // Finish
  async onFinish() {
    const loading = await this.loadingCtrl.create();
    await loading.present();
    this.isUpdate = false;
    //
    this.isAddPms = false;
    this.isEditRowPms = false;
    this.indexEditRowPms = null;
    this.update_pms = <Update_infos_benef>{};
    //
    this.isAddParce = false;
    this.isRowEditParce = false;
    this.indexEditRowParce = null;
    setTimeout(() => {
      this.loadPmsAsso();
      this.loadingCtrl.dismiss();
    }, 500);
  }
  // Update
  onUpdate() {
    this.isUpdate = true;
  }

  onAddPms() {
    this.isAddPms = true;
  }

  onDeletePms(elem_pms: any) {
    let element_pms: Benef_activ_pms = elem_pms;
    console.log("::::Element PMS To Delete:::::", element_pms);
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '500px',
      data: {
        elem_pms: element_pms
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result != undefined) {
        if (element_pms.etat_pms === SYNC) {
          // delete
          this.loadData.findContratPMS(element_pms.code_benef_pms).then(res_pms => {
            let data_contrat: Find_contrat_pms[] = res_pms.values;
            if (data_contrat.length > 0) {
              data_contrat.forEach((elem_contrat, ind_contrat) => {
                let code_contrat = {
                  code_contrat: elem_contrat.code_contrat
                }
                this.loadData.findMEPContrat(elem_contrat.code_contrat).then(res => {
                  let data_mep_contrat: Find_mep_contrat_pms[] = res.values;
                  if (data_mep_contrat.length > 0) {
                    data_mep_contrat.forEach((elem_mep, ind_mep) => {
                      this.loadData.findSuiviMEPContrat(elem_mep.code_culture).then(res_suivi => {
                        let data_suivi: Find_suivi_MEP_pms[] = res_suivi.values;
                        // Delete suivi PMS
                        if (data_suivi.length > 0) {
                          let code_culture = {
                            code_mep: elem_mep.code_culture
                          }
                          this.crudService.deleteSuiviPms(code_culture);
                        }
                        // Fin du boucle
                        if((data_mep_contrat.length - 1) === ind_mep) {
                          this.crudService.deleteMepPms(code_contrat);
                          this.crudService.deleteContratPMS(code_contrat);
                          if ((data_contrat.length - 1) === ind_contrat) {
                            this.crudService.deletePMS(element_pms.code_benef_pms);
                            //this.crudService.deleteBenef(element_pms.code_benef);
                            this.loadPmsAsso();
                          }
                        }
                      });
                    });
                  } else {
                    this.crudService.deleteContratPMS(code_contrat);
                    if ((data_contrat.length - 1) === ind_contrat) {
                      this.crudService.deletePMS(element_pms.code_benef_pms);
                      //this.crudService.deleteBenef(element_pms.code_benef);
                      this.loadPmsAsso();
                    }
                  }
                });
              });
            } else {
              this.crudService.deletePMS(element_pms.code_benef_pms);
              //this.crudService.deleteBenef(element_pms.code_benef);
              this.loadPmsAsso();
            }
          });
        } else if (element_pms.etat_pms === VALIDE) {
          // mise à jour
        }
      }
    });
  }
  onDeleteContrat(elem_contrat: any) {
    let element_contrat: Loc_Parce_saison = elem_contrat;
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '500px',
      data: {
        elem_contrat: element_contrat
      }
    });
    dialogRef.afterClosed().subscribe(resultat => {
      if (resultat != undefined) {
        if (element_contrat.etat_contrat === SYNC) {
          this.deleteContrat(element_contrat);

        } else if (element_contrat.etat_contrat === VALIDE) {
          // Update contrat
        }
      }
    });
  }
  deleteContrat(elem_contrat: any) {
    let element_contrat: Loc_Parce_saison = elem_contrat;
    console.log("::::Element Contrat To Delete:::::", element_contrat);
    let code_contrat = {
      code_contrat: element_contrat.code_parce_saison
    }
    if (element_contrat.etat_contrat === SYNC) {
      this.loadData.findMEPContrat(element_contrat.code_parce_saison).then(res => {
        let data_mep_contrat: Find_mep_contrat_pms[] = res.values;
        if (data_mep_contrat.length > 0) {
          data_mep_contrat.forEach((elem_mep, ind_mep) => {
            this.loadData.findSuiviMEPContrat(elem_mep.code_culture).then(res_suivi => {
              let data_suivi: Find_suivi_MEP_pms[] = res_suivi.values;
              // Delete suivi PMS
              if (data_suivi.length > 0) {
                let code_culture = {
                  code_mep: elem_mep.code_culture
                }
                this.crudService.deleteSuiviPms(code_culture);
              }
              // Fin du boucle
              if((data_mep_contrat.length - 1) === ind_mep) {
                let code_contrat = {
                  code_contrat: element_contrat.code_parce_saison
                }
                this.crudService.deleteMepPms(code_contrat);
                this.crudService.deleteContratPMS(code_contrat);
                this.loadPmsAsso();
              }
            });
          });
        } else {
          this.crudService.deleteContratPMS(code_contrat);
          this.loadPmsAsso();
        }
      });
    }
  }

  // save pms
  onCancelAddPms(data: any) {
    if (data.src === 'add') {
      this.isAddPms = false;
      this.update_pms = <Update_infos_benef>{};
    } else if (data.src === 'edit') {
      this.isEditRowPms = false;
      this.update_pms = <Update_infos_benef>{};
      this.indexEditRowPms = null;
    }
  }

  async onSaveAddPms(data) {
    const loading = await this.loadingCtrl.create();
    await loading.present();
    let img_cin: string[] = [];

    if (this.update_pms.img_cin_1.data != null) {
      img_cin.push(this.update_pms.img_cin_1.data);
    } 
    
    if (this.update_pms.img_cin_2.data != null) {
      img_cin.push(this.update_pms.img_cin_2.data);
    }
    let data_to_add: UpdateBenef = {
      code_benef: null,
      img_benef: this.update_pms.img_pr != null? this.update_pms.img_pr.data: null,
      nom: this.update_pms.nom,
      prenom: this.update_pms.prenom,
      sexe: this.update_pms.sexe,             
      dt_nais: this.update_pms.dt_naissance,
      dt_nais_vers: this.update_pms.dt_naissance_vers,
      surnom: this.update_pms.surnom,
      cin: this.update_pms.cin,
      dt_delivrance: this.update_pms.dt_delivrance,
      lieu_delivrance: this.update_pms.lieu_delivrance,
      img_cin:  img_cin.length > 0? JSON.stringify(img_cin.join("-")):null,
      contact: this.update_pms.contact,
      id_fkt: this.update_pms.fokontany != null?this.update_pms.fokontany.code_fkt:null,
      id_commune: this.update_pms.village != null?this.update_pms.commune.code_com: null,
      village: this.update_pms.village,
      dt_Insert: null,
      etat: null,
      statut: null
    };
    let add_pms: UpdatedBenefActivPms = {
      code_benef_pms: null,
      code_pms_temp: null,
      code_achat: this.update_pms.code_achat,
      id_proj: this.projet.code_proj,
      id_benef: null,
      id_activ: this.activite.id_activ,
      id_association: this.update_pms.association.code_ass,
      id_collaborateur: this.update_pms.collaborateur.id_col,
      etat: null,
      status: null
    }
    if (data.src === 'add') {
      console.log(":::Data to Add:::", this.update_pms.association);
      let code_benef: string = this.user[this.user.length - 1].id_equipe +  this.projet.ancronyme + '-' + 'B' + '-' + moment().format('YYYYMMDD-HHmmss');
      
      data_to_add.code_benef = code_benef;
      data_to_add.dt_Insert = moment().format("YYYY-MM-DD");
      data_to_add.etat = SYNC;
      data_to_add.statut = ACTIVE;
      this.crudService.AddBenef_(data_to_add).then(res => {
        this.loadData.loadCodePms(this.update_pms.association.code_ass).then(res_code_pms => {
          let data_code_pms: Generate_code_pms[] = res_code_pms.values;
          let order_pms: number = 1;
          let num_pms: string = '';
          //
          if (data_code_pms.length  > 0) {
            let last_code_pms_temp = data_code_pms[data_code_pms.length - 1].code_pms_temp;
            let arr_code_pms_temp = last_code_pms_temp.split('-');
            order_pms = parseInt(arr_code_pms_temp[arr_code_pms_temp.length - 1]) + 1;
          }

          if (order_pms < 100) {
            if (order_pms < 10) {
              num_pms = '00';
            } else {
              num_pms = '0';
            }
          }
          //
          let code_pms: string = 'B' + '-' + this.update_pms.association.numero + this.update_pms.association.ancronyme + '-' + moment().format('YYYYMMDD-HHmmss');
          add_pms.code_benef_pms = code_pms;
          add_pms.code_pms_temp = 'B' + '-' + this.update_pms.association.numero + this.update_pms.association.ancronyme + '-' + num_pms + order_pms;
          add_pms.id_benef = code_benef;
          add_pms.etat = SYNC;
          add_pms.status = ACTIVE;
          console.log(":::::Pms ToAdd Data:::", add_pms);
          this.crudService.AddPms(add_pms).then(res => {
            this.loadData.loadBeneficiairePms({code_benef_pms: add_pms.code_benef_pms}).then((res_pms) => {
              let new_pms: Benef_activ_pms = res_pms.values[0];
              new_pms.parcelle = [];
              this.dataSourceBenef.data = [new_pms, ...this.dataSourceBenef.data];
            });
            this.isAddPms = false;
            this.update_pms = <Update_infos_benef>{};
            this.loadingCtrl.dismiss();
          });
        });
      });
    } else if (data.src === 'edit') {
      let element_pms: Benef_activ_pms = data.elem_pms;
      data_to_add.code_benef = element_pms.code_benef;
      data_to_add.dt_Insert = moment().format("YYYY-MM-DD");
      data_to_add.etat = element_pms.etat_benef === SYNC?SYNC:UPDATE;
      data_to_add.statut = ACTIVE;
      console.log(":::Data info to Edit:::", data_to_add);
      this.crudService.UpdateBenef(data_to_add).then(res => {
        add_pms.code_benef_pms = element_pms.code_benef_pms;
        add_pms.code_pms_temp = element_pms.code_pms_temp;
        add_pms.id_benef = element_pms.code_benef;
        add_pms.etat = element_pms.etat_pms === SYNC?SYNC:UPDATE;
        add_pms.status = ACTIVE;
        let update_data = {
          isUpdatePms: true,
          data_pms: add_pms
        }
        console.log(":::Data Pms to Edit:::", add_pms);
        this.crudService.UpdatePms(update_data).then(res => {
          //
          setTimeout(() => {
            this.initPropr();
            this.loadPmsAsso();
          }, 500);
          this.isEditRowPms = false;
          this.update_pms = <Update_infos_benef>{};
          this.indexEditRowPms = null;
          this.loadingCtrl.dismiss();
        });
      });
    }
  }
  onCancelParce(data: any) {
    if (data.src === 'add') {
      this.isAddParce = false;
      this.indexEditRowPms = null;
    } else if (data.src === 'edit') {
      this.isRowEditParce = false;
      this.indexEditRowPms = null;
      this.indexEditRowParce = null;
    }
  }
  // Update Pms
  async onSaveParce(data: any) {
    const loading = await this.loadingCtrl.create();
    await loading.present();
    let elem_pms: Benef_activ_pms = data.elem_pms;
    let data_To_add_parce: UpdateParcellePms = {
      code_parce: null,
      code_parce_temp: null,
      id_assoc: elem_pms.id_association,
      id_benef: elem_pms.code_benef,
      ref_gps: this.update_parce_pms.ref_gps,
      lat: this.update_parce_pms.latitude,
      log: this.update_parce_pms.longitude,
      superficie: this.update_parce_pms.superficie,
      id_fkt: this.update_parce_pms.fokontany != null ? this.update_parce_pms.fokontany.code_fkt : null,
      id_commune: this.update_parce_pms.village != null && this.update_parce_pms.fokontany == null ? this.update_parce_pms.commune.code_com : null,
      village: this.update_parce_pms.village,
      anne_adheran: null,
      indication: null,
      etat: null,
      status: null
    }
    let data_To_add_parceSaison: UpdateParceSaisonPms = {
      code: null,
      code_contrat: null,
      id_annee: this.update_parce_pms.annee != null ? this.update_parce_pms.annee.code : null,
      id_saison: this.update_parce_pms.saison != null ? this.update_parce_pms.saison.code_saison : null,
      id_pms: elem_pms.code_benef_pms,
      id_parce: null,
      ref_gps: this.update_parce_pms.ref_gps_saison,
      lat: this.update_parce_pms.latitude_saison,
      log: this.update_parce_pms.longitude_saison,
      id_var: this.update_parce_pms.variette != null ? this.update_parce_pms.variette.code_var : null,
      objectif: this.update_parce_pms.objectif,
      etat: null,
      commentaire: null
    }

    if (data.src === 'add') {
      let association: Loc_association;
      let code_contrat: number;
      let num_contrat: string = '';

      this.association.forEach(elem_association => {
        if (elem_association.code_ass === elem_pms.id_association) {
          association = elem_association;
        }
      });
      
      // generadte code contrat
      let param_code_contrat = {
        code_annee: this.update_parce_pms.annee.code,
        code_saison: this.update_parce_pms.saison.code_saison,
        code_assoc: association.code_ass
      }
      this.loadData.loadCodeParceSaisonContrat(param_code_contrat).then(res_code_contrat => {
        let data_code_contrat: Generate_code_contrat_pms[] = res_code_contrat.values;
        let annee_saison = this.update_parce_pms.annee.annee_du.toString().charAt(2) + this.update_parce_pms.annee.annee_du.toString().charAt(3) + this.update_parce_pms.annee.annee_au.toString().charAt(2) + this.update_parce_pms.annee.annee_au.toString().charAt(3);

        if (data_code_contrat.length > 0) {
          let last_code_contrat = data_code_contrat[data_code_contrat.length - 1].code_contrat;
          let array_code_contrat = last_code_contrat.split('-');
          code_contrat = parseInt(array_code_contrat[array_code_contrat.length - 1]) + 1;
        } else code_contrat = 1;

        if (code_contrat < 100) {
          if (code_contrat < 10) {
            num_contrat = '00';
          } else {
            num_contrat = '0';
          }
        }

        data_To_add_parceSaison.code_contrat = 'C-' + association.numero + association.ancronyme + '-' + annee_saison + this.update_parce_pms.saison.intitule + '-' + num_contrat + code_contrat;
        data_To_add_parceSaison.code =  'PSS' + '-' + association.numero + association.ancronyme + '-' + moment().format('YYYYMMDDHHmmss');
        data_To_add_parceSaison.etat = SYNC;
  
        if (this.update_parce_pms.isNewparce != null) {

          if (this.update_parce_pms.isNewparce) {
            let order_parce: number;
            let num_parce: string = '';

            this.loadData.loadCodeParceAssoc(param_code_contrat).then(res_code_parce => {
              let data_parce: Generate_code_assoc_parce[] = res_code_parce.values;
              if (data_parce.length > 0) {
                let last_code_parce = data_parce[data_parce.length - 1].code_parce_temp;
                let array_code_parce = last_code_parce.split('-');
                order_parce = parseInt(array_code_parce[array_code_parce.length - 1]) + 1;
              } else order_parce = 1;

              //
              if (order_parce < 100) {
                if (order_parce < 10) {
                  num_parce = '00';
                } else {
                  num_parce = '0';
                }
              }
              
              let code_parce = association.numero + association.ancronyme + '-' + moment().format('YYYYMMDD-HHmmss');
              let code_parce_tmp = 'P-' + association.numero + association.ancronyme + '-' + annee_saison + this.update_parce_pms.saison.intitule + '-' + num_parce + order_parce; // A faire
              data_To_add_parce.code_parce = code_parce;
              data_To_add_parce.code_parce_temp = code_parce_tmp;
              data_To_add_parce.etat = SYNC;
              data_To_add_parce.status = ACTIVE;
              console.log("::::Data Parcelle Association:::::", data_To_add_parce);
    
              this.crudService.AddParcellePms(data_To_add_parce).then(res => {
                data_To_add_parceSaison.id_parce = code_parce;
    
                console.log("::::Data Parcelle Saison:::::", data_To_add_parceSaison);
    
                this.crudService.AddParcelleSaisonPms(data_To_add_parceSaison).then(res => {
                  console.log("::::Added Parcelle Saison:::");
                  // refresh dataSource
                  const data_parce = {
                    code_ass: elem_pms.id_association,
                    code_prj: this.projet.code_proj,
                    code_pms: elem_pms.code_benef_pms
                  }
                  this.loadData.loadParcelleSaison(data_parce).then(parce_ss => {
                    this.dataSourceBenef.data.forEach(res_src => {
                      if (res_src.code_benef_pms === elem_pms.code_benef_pms) {
                        res_src.parcelle = parce_ss.values;
                      }
                    });
                  });
                  this.isAddParce = false;
                  this.indexEditRowPms = null;
                });
    
              });
            });
          }
        } else {
          data_To_add_parceSaison.id_parce = this.update_parce_pms.parcelle != null?this.update_parce_pms.parcelle.code_parce:null;
  
          console.log("::::Data Parcelle Saison:::::", data_To_add_parceSaison);
          this.crudService.AddParcelleSaisonPms(data_To_add_parceSaison).then(res => {
            console.log("::::Added Parcelle Saison:::");
            // refresh data source
            const data_parce = {
              code_ass: elem_pms.id_association,
              code_prj: this.projet.code_proj,
              code_pms: elem_pms.code_benef_pms
            }
            this.loadData.loadParcelleSaison(data_parce).then(parce_ss => {
              this.dataSourceBenef.data.forEach(res_src => {
                if (res_src.code_benef_pms === elem_pms.code_benef_pms) {
                  res_src.parcelle = parce_ss.values;
                }
              });
            });
            this.isAddParce = false;
            this.indexEditRowPms = null;
          });
        }
        this.loadingCtrl.dismiss();
      });
    } else if (data.src === 'edit') {
      // Edit
      let elem_parce: Loc_Parce_saison = data.elem_parce;
      if (this.update_parce_pms.isNewparce != null) {
        // Ajouter nouveau parcelle
        if (this.update_parce_pms.isNewparce) {
          console.log("::::Edit:::::Ajout Nouvelle Parcelle:::");
          let association: Loc_association;
          this.association.forEach(elem_association => {
            if (elem_association.code_ass === elem_pms.id_association) {
              association = elem_association;
            }
          });

          let data_code_parce = {
            code_annee: this.update_parce_pms.annee.code,
            code_saison: this.update_parce_pms.saison.code_saison,
            code_assoc: association.code_ass
          }
          
          let order_parce: number;
          let annee_saison = this.update_parce_pms.annee.annee_du.toString().charAt(2) + this.update_parce_pms.annee.annee_du.toString().charAt(3) + this.update_parce_pms.annee.annee_au.toString().charAt(2) + this.update_parce_pms.annee.annee_au.toString().charAt(3);
          let num_parce: string = '';

          this.loadData.loadCodeParceAssoc(data_code_parce).then(res_code_parce => {
            let data_parce: Generate_code_assoc_parce[] = res_code_parce.values;
            if (data_parce.length > 0) {
              let last_code_parce = data_parce[data_parce.length - 1].code_parce_temp;
              let array_code_parce = last_code_parce.split('-');
              order_parce = parseInt(array_code_parce[array_code_parce.length - 1]) + 1;
            } else order_parce = 1;

            if (order_parce < 100) {
              if (order_parce < 10) {
                num_parce = '00';
              } else {
                num_parce = '0';
              }
            }

            //
            let code_parce_tmp = 'P-' + association.numero + association.ancronyme + '-' + annee_saison + this.update_parce_pms.saison.intitule + '-' + num_parce + order_parce; // A faire
            let code_parce = association.numero + association.ancronyme + '-' + moment().format('YYYYMMDD-HHmmss');
            data_To_add_parce.code_parce = code_parce;
            data_To_add_parce.code_parce_temp = code_parce_tmp;
            data_To_add_parce.etat = SYNC;
            data_To_add_parce.status = ACTIVE;
            console.log("::::Data Parcelle Edit Association:::::", data_To_add_parce);
            this.crudService.AddParcellePms(data_To_add_parce).then(res => {
              console.log("::::Updated Parcelle Association:::::");
              data_To_add_parceSaison.code = elem_parce.code_parce_saison;
              data_To_add_parceSaison.id_parce = code_parce;
              data_To_add_parceSaison.etat = elem_parce.etat_contrat === SYNC?SYNC:UPDATE;
              console.log("::::Data Parcelle Saison:::::", data_To_add_parceSaison);
              let data_to_update = {
                isUpdateParceSaison: true,
                data_parce_saison: data_To_add_parceSaison
              }
              this.crudService.UpdateParcelleSaisonPms(data_to_update).then(res => {
                console.log("::::Updated Parcelle Saison:::");
                const data_parce = {
                  code_ass: elem_pms.id_association,
                  code_prj: this.projet.code_proj,
                  code_pms: elem_pms.code_benef_pms
                }
                this.loadData.loadParcelleSaison(data_parce).then(parce_ss => {
                  this.dataSourceBenef.data.forEach(res_src => {
                    if (res_src.code_benef_pms === elem_pms.code_benef_pms) {
                      res_src.parcelle = parce_ss.values;
                    }
                  });
                });
                this.isRowEditParce = false;
                this.indexEditRowPms = null;
                this.indexEditRowParce = null;
                this.loadingCtrl.dismiss();
              });
            });
          });
        }
      } else {
        if (this.update_parce_pms.parcelle != null && this.update_parce_pms.parcelle.etat_parce === SYNC) {
          console.log("::::Edit:::::Parcelle n'est encore synchroniser:::");
          data_To_add_parce.code_parce = elem_parce.code_parce;
          data_To_add_parce.etat = elem_parce.etat_parce;
          data_To_add_parce.status = ACTIVE;
          let data_update_parce = {
            isUpdateParcePms: true,
            data_parce: data_To_add_parce
          }
          console.log("::::Data Edit Parcelle Association:::::", data_To_add_parce);
          this.crudService.UpdateParcellePms(data_update_parce).then(res => {
            data_To_add_parceSaison.code = elem_parce.code_parce_saison;
            data_To_add_parceSaison.id_parce = this.update_parce_pms.parcelle != null?this.update_parce_pms.parcelle.code_parce:null;
            data_To_add_parceSaison.etat = elem_parce.etat_contrat === SYNC?SYNC:UPDATE;
            console.log("::::Data Parcelle Edit Saison:::::", data_To_add_parceSaison);
            let data_to_update = {
              isUpdateParceSaison: true,
              data_parce_saison: data_To_add_parceSaison
            }
            this.crudService.UpdateParcelleSaisonPms(data_to_update).then(res => {
              console.log("::::Updated Parcelle Saison:::");
              const data_parce = {
                code_ass: elem_pms.id_association,
                code_prj: this.projet.code_proj,
                code_pms: elem_pms.code_benef_pms
              }
              this.loadData.loadParcelleSaison(data_parce).then(parce_ss => {
                this.dataSourceBenef.data.forEach(res_src => {
                  if (res_src.code_benef_pms === elem_pms.code_benef_pms) {
                    res_src.parcelle = parce_ss.values;
                  }
                });
              });
              this.isRowEditParce = false;
              this.indexEditRowPms = null;
              this.indexEditRowParce = null;
              this.loadingCtrl.dismiss();
            });
          });
        } else {
          // A definir ou parcelle déjà enregistrer
          data_To_add_parceSaison.code = elem_parce.code_parce_saison;
          data_To_add_parceSaison.id_parce = this.update_parce_pms.parcelle != null?this.update_parce_pms.parcelle.code_parce:null;
          data_To_add_parceSaison.etat = elem_parce.etat_contrat === SYNC?SYNC:UPDATE;
          console.log("::::Data Parcellev Edit Saison:::::", data_To_add_parceSaison);
          let data_to_update = {
            isUpdateParceSaison: true,
            data_parce_saison: data_To_add_parceSaison
          }
          this.crudService.UpdateParcelleSaisonPms(data_to_update).then(res => {
            console.log("::::Updated Parcelle Saison:::");
            const data_parce = {
              code_ass: elem_pms.id_association,
              code_prj: this.projet.code_proj,
              code_pms: elem_pms.code_benef_pms
            }
            this.loadData.loadParcelleSaison(data_parce).then(parce_ss => {
              this.dataSourceBenef.data.forEach(res_src => {
                if (res_src.code_benef_pms === elem_pms.code_benef_pms) {
                  res_src.parcelle = parce_ss.values;
                }
              });
            });
            this.isRowEditParce = false;
            this.indexEditRowPms = null;
            this.indexEditRowParce = null;
            this.loadingCtrl.dismiss();
          });
        }
      }
    }
  }

  // Update Pms
  async onUpdatePms(data: any) {
    let data_: any;
    if (data.src === 'add') {
      data_ = {
        isPms: true,
        isAdd: true,
        zone: {
          region: this.data_region,
          district: this.data_district,
          commune: this.data_commune,
          fokontany: this.data_fokontany
        },
        association: this.association,
        collaborateur: this.data_collaborateur
      }
    } else if (data.src === 'edit') {
      data_ = { 
        isPms: true,
        isEdit: true,
        zone: {
          region: this.data_region,
          district: this.data_district,
          commune: this.data_commune,
          fokontany: this.data_fokontany
        },
        association: this.association,
        collaborateur: this.data_collaborateur,
        element: data.element
      }
    }
    let modal = await this.modalCtrl.create({
      component: ModalPrPage,
      cssClass: 'modal-custum-pr',
      backdropDismiss: true,
      componentProps: data_
    });
    modal.onDidDismiss().then(data_modal => {
      console.log("Modal Dismissed!!");
      if (data_modal.data != undefined) {
        console.log("Modal Data with data", data_modal.data);
        this.update_pms = data_modal.data;
        this.update_pms.dt_naissance = data_modal.data.dt_naissance != null? data_modal.data.dt_naissance.format("YYYY-MM-DD"): data_modal.data.dt_naissance;
        this.update_pms.dt_delivrance = data_modal.data.dt_delivrance != null? data_modal.data.dt_delivrance.format("YYYY-MM-DD"): data_modal.data.dt_delivrance;
        
        if (data.src === 'add') {
          this.isAddPms = true;
        } else if (data.src === 'edit') {
          this.isEditRowPms = true;
          this.indexEditRowPms = data.ind_pms;
        }
      }
    });
    await modal.present();
  }

  // Updated Parcelle
  async onUpdatedContrat(data: any) {
    let data_: any;
    if (data.src === 'add') {
      //{src: 'add', data_pms: element, index_pms: i}
      data_ = {
        isParcePms: true,
        isAdd: true,
        zone: {
          region: this.data_region,
          district: this.data_district,
          commune: this.data_commune,
          fokontany: this.data_fokontany
        },
        data_initial: {
          annee_ag: this.data_annee_agricole,
          saison: this.data_saison,
          categorie: this.data_categ,
          espece: this.data_espece,
          variette: this.data_var
        },
        elem_pms: data.data_pms
      }
    } else if (data.src === 'edit') {
      //{src: 'edit', data_pms: element, data_parce: row, index_parce: ind_parce, index_pms: i}
      data_ = { 
        isParcePms: true,
        isEdit: true,
        zone: {
          region: this.data_region,
          district: this.data_district,
          commune: this.data_commune,
          fokontany: this.data_fokontany
        },
        data_initial: {
          annee_ag: this.data_annee_agricole,
          saison: this.data_saison,
          categorie: this.data_categ,
          espece: this.data_espece,
          variette: this.data_var
        },
        elem_pms: data.data_pms,
        elem_parce: data.data_parce
      }
    }
    let modal = await this.modalCtrl.create({
      component: ModalPrPage,
      cssClass: 'modal-custum-pr',
      backdropDismiss: true,
      componentProps: data_
    });
    modal.onDidDismiss().then(data_modal => {
      console.log("Modal Dismissed!!");
      if (data_modal.data != undefined) {
        console.log("Modal Data with data", data_modal.data);
        this.update_parce_pms = data_modal.data;
        
        if (data.src === 'add') {
          this.isAddParce = true;
          this.indexEditRowPms = data.index_pms;
        } else if (data.src === 'edit') {
          this.isRowEditParce = true;
          this.indexEditRowPms = data.index_pms;
          this.indexEditRowParce = data.index_parce;
        }
      }
    });
    await modal.present();
  }

  // View Image
  // Show Img
  async onViewImage(elem_pms: Benef_activ_pms) {
    let modal =  await this.modalCtrl.create({
      component: VisualiseurImagePage,
      cssClass: 'custom-view-img',
      backdropDismiss: true,
      componentProps: {
        isImgCinPms: true,
        elem_pms: elem_pms
      }
    });
    modal.onDidDismiss().then(modal_data => {
      if (modal_data != undefined) {
        
      }
    });
    await modal.present();
  }

  onRowClicked(row) {
    console.log(row);
    if (this.expandedElement === row) this.expandedElement = null 
    else this.expandedElement = row;
  }

  async selectMatTab(index: number) {
    console.log("index Mat-Tab Selected : " + index);
    this.initPropr();
    if (index == 0) {
      this.dataSource.filter = '';
      this.dataSource.data = this.association;
    } else if (index == 1) {
      //this.refreshDataSource();
      this.onFinish();
    } else if(index == 2) {
      this.loadExportContrat(this.parcelle_saison_pms);
      this.onFinish();
      //this.dataSourceParce.data = this.parcelle_saison_pms;
    }
  }

  initPropr() {
    this.selectedAssocContrat = <Loc_association>{};
    this.selectedAssocPms = <Loc_association>{};
  }

  async presentModal() {
    console.log("Activité:::", this.activite);
    console.log("Projet:::", this.projet);
    console.log("Users:::", this.user);
    const modal = await this.modalCtrl.create({
      component: ModalPage,
      componentProps: {
        'isModificationZone': true,
        'activite': this.activite
      }
    });
    modal.onDidDismiss().then(async (data_dism) => {
      console.log(data_dism);
      if (data_dism.data != undefined) {
        console.log("***Modal Data***", data_dism);
        // Initialized data source an property
        this.initPropr();
        this.dataSource.filter = '';
        this.dataSourceBenef.filter = '';    
        this.dataSourceParce.filter = '';
        // load data
        this.sharedService.setData(data_dism); // shared zone selected to other component
        this.region = data_dism.data.region;
        this.district = data_dism.data.district;
        this.commune = data_dism.data.commune;
        this.loadFktAssociation();

        // Initialized data
        setTimeout(() => {
          this.dataSource.data = this.association;
          this.dataSourceBenef.data =  this.data_pms;
          this.dataSourceParce.data = this.parcelle_saison_pms;
        }, 1000);

        this.router.routeReuseStrategy.shouldReuseRoute = () => false;
        this.router.onSameUrlNavigation = 'reload';
        this.router.navigate(['./'], {
          relativeTo: this.route
        })
      }
    });
    await modal.present();
  }

  onToggleTableRows() {
    this.isTablePRExpanded = !this.isTablePRExpanded;
    this.dataSourceBenef.data.forEach(row => {
      if (row.parcelle.length > 0) {
        row.isExpanded = this.isTablePRExpanded;
      } else {
        if (row.isExpanded) {
          row.isExpanded = false;
        }
      }
    });
  }

  onAddShowPms(data: any) {
    //let data_ = {data: row, index_: i}
    this.isTablePRExpanded = !this.isTablePRExpanded;
    console.log(data);
    this.dataSourceBenef.data.forEach((row, ind) => {
      row.isExpanded = this.isTablePRExpanded;
    });
  }
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
  //
  loadDataInitial() {
    this.loadData.loadAnneeAgricole().then(res => {
      this.data_annee_agricole = res.values;
    });
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
  // load Collabvorateur
  loadCollaborateur() {
    console.log(":::::activite::::", this.activite);
    this.loadData.loadCollaborateursActivite(this.activite.id_activ).then(res => {
      this.data_collaborateur = res.values;
    });
  }

  loadPArcelleTest() {
    this.loadData.loadAllTable('assoc_parce_saison').then(res => {
      console.log(":::Association par saison assoc_parce_saison::::", res.values);
    });
    this.loadData.loadAllTable('annee_agricole').then(res => {
      console.log(":::Association annee_agricole::::", res.values);
    });
  }
  onClick() {
    this.router.navigate(['homes']);
  }
}

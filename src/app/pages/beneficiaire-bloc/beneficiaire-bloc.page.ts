import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { LoadingController, ModalController } from '@ionic/angular';
import { BehaviorSubject } from 'rxjs';
import { UpdateBenef, UpdatedBenefBloc, UpdateParceBloc } from 'src/app/interfaces/interface-insertDb';
import { Find_mep_parce_bloc, Find_parce_benf_bloc, Local_benef_activ_bl, Local_bloc_parce, Local_bloc_zone, Loc_activ_projet, Loc_Bloc, Loc_Bloc_Parce_All, Loc_Collabo_Activite, Loc_Commune, Loc_district, Loc_export_excel, Loc_Fokontany, Loc_generate_code_benef, Loc_region, Update_infos_benef } from 'src/app/interfaces/interfaces-local';
import { CrudDbService } from 'src/app/services/local/crud-db.service';
import { LoadDataService } from 'src/app/services/local/load-data.service';
import { Utilisateurs } from 'src/app/utils/interface-bd';
import { ModalPrPage } from '../modals/modal-pr/modal-pr.page';

import * as _moment from 'moment';
import { ACTIVE, ISSYNC, SYNC, UPDATE, VALIDE} from 'src/app/utils/global-variables';
import { ExportExcelService } from 'src/app/services/export-excel.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from 'src/app/component/dialog/dialog.component';
import { VisualiseurImagePage } from '../modals/visualiseur-image/visualiseur-image.page';



const moment = _moment;

interface Update_Parce_bl {
  code_parce_temp: number,
  bloc: Loc_Bloc,
  ref_gps: string,
  latitude: number,
  longitude: number,
  superficie: number,
  region: Loc_region,
  district: Loc_district,
  commune: Loc_Commune,
  fokontany: Loc_Fokontany,
  village: string,
  indication: string
}

@Component({
  selector: 'app-beneficiaire-bloc',
  templateUrl: './beneficiaire-bloc.page.html',
  styleUrls: ['./beneficiaire-bloc.page.scss'],
  animations: [ //utiliser pour @detailExpand (table expendable)
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ])
  ]
})
export class BeneficiaireBlocPage implements OnInit {
  private isRouterActive: BehaviorSubject<boolean> = new BehaviorSubject(false);
  private isCommuneLoaded: BehaviorSubject<boolean> = new BehaviorSubject(false);

  private data_bloc: Loc_Bloc[] = [];
  private data_benef: Local_benef_activ_bl[] = [];
  data_bloc_zone: Local_bloc_zone[] = [];
  data_bloc_parce: Local_bloc_parce[] = [];
  data_bloc_parce_all: Loc_Bloc_Parce_All[] = [];

  private update_benef: Update_infos_benef = {
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

  // Displayed Column
  displayedColumns: string[] = ['code_bloc', 'nom_bloc', 'nb_benef', 'nb_parce', 'zone_district', 'technicien', 'action'];
  displayedColumnsZone: string[] = ['commune', 'fkt', 'km_responsable'];
  displayedColumnsBenef: string[] = ['nom_bloc', 'code_benef_bl', 'code_achat', 'nom', 'sexe', 'dt_nais', 'cin', 'img_cin', 'nom_com', 'nom_fkt', 'nb_parcelle', 'sum_superficie', 'action'];
  displayedColumnsAddBenef: string[] = ['new_nom_bloc', 'new_code_benef_bl', 'new_code_achat', 'new_nom', 'new_sexe', 'new_dt_nais', 'new_cin', 'new_img_cin', 'new_nom_com', 'new_nom_fkt', 'new_nb_parcelle', 'new_sum_superficie', 'new_action'];
  displayedColumnsParceBenef: string[] = ['code_parce', 'ref_gps', 'lat', 'log', 'superficie', 'commune', 'fokontany', 'indication', 'action'];
  displayedColumnsAddParceBenef: string[] = ['new_code_parce', 'new_ref_gps', 'new_lat', 'new_log', 'new_superficie', 'new_commune', 'new_fokontany', 'new_indication', 'new_action'];
  displayedColumnsParcelle: string[] = ['nom_bloc', 'id_parce', 'code_benef_bl', 'nom', 'cin', 'fokontany_benef', 'lat', 'log', 'superficie', 'fokontany_parce'];

  // Data Source
  dataSource = new MatTableDataSource<Loc_Bloc>();
  dataSourceZone = new MatTableDataSource<Local_bloc_zone>();
  dataSourceBenef = new MatTableDataSource<Local_benef_activ_bl>();
  dataSourceParcelle = new MatTableDataSource<Loc_Bloc_Parce_All>();
  dataSourceParceBenef = new MatTableDataSource<Local_bloc_parce>();
  filterDataBloc: any[] = [];

  region: any;
  district: any;
  isClickedBloc: boolean = false;
  isClickedBenef: boolean = false;
  selectedBloc: Loc_Bloc;
  user: Utilisateurs[];
  projet: any;
  activite: Loc_activ_projet;

  data_region: Loc_region[] = [];
  data_district: Loc_district[] = [];
  data_commune: Loc_Commune[] = [];
  data_fokontany: Loc_Fokontany[] = [];

  data_collaborateur: Loc_Collabo_Activite[] = [];

  private update_parce: Update_Parce_bl = <Update_Parce_bl>{};

  isUpdate: boolean = false;
  isAddBenef: boolean = false;
  isEditRowBenef: boolean = false;

  indexEditRowBenef: number;

  isAddParce: boolean = false;
  isRowEditParce: boolean = false;
  indexEditRowparce: number;

  data_bloc_export: any[] = [];
  data_bloc_zone_export: any[] = [];
  data_benef_export: any[] = [];
  data_parce_export: any[] = [];

  isTableBenefExpanded = false;

  etat_sync = SYNC;
  etat_valide = VALIDE;
  etat_update = UPDATE;

  // Bloc Paginator
  @ViewChild('blocPaginator') blocPaginator: MatPaginator;
  @ViewChild('blocSort') blocSort: MatSort;

  // Beneficiaire Paginator
  @ViewChild('benefPaginator') benefPaginator: MatPaginator;
  @ViewChild('benefSort') benefSort: MatSort;

  // Parcelle Paginator
  @ViewChild('parcellePaginator') parcellePaginator: MatPaginator;
  @ViewChild('parcelleSort') parcelleSort: MatSort;

  constructor(private router: Router, 
              private loadData: LoadDataService,
              private loadingCtrl: LoadingController,
              public modalCtrl: ModalController,
              private crudDb: CrudDbService,
              private exportExcel: ExportExcelService,
              private dialog: MatDialog) { 
    if (this.router.getCurrentNavigation().extras.state) {
      let data: any;
      const routeState = this.router.getCurrentNavigation().extras.state;
      console.log(routeState);
      data = JSON.parse(routeState.zone);
      this.projet = JSON.parse(routeState.projet);
      this.user = JSON.parse(routeState.user);
      this.activite = routeState.activite;
      console.log("Beneficiaire Bloc =====>");
      console.log(data);
      this.region = data.data.region;
      this.district = data.data.district;


      console.log(this.region);
      console.log(this.district);

      this.isRouterActive.next(true);
      /**
      * {code_dist: 'D01', nom_dist: 'Ambovombe-Androy', id_reg: 'R01'}
      */
      //{"code_proj":"P02","nom":"AFAFI SUD Lot 1","description":"null","logo":"null","statuts":"activer"}
    }
    this.isRouterActive.subscribe(isActive => {
      if (isActive) {
        console.log("Constructeur Beneficiaire Active router");
        if (!this.isCommuneLoaded.value) {
          console.log(this.isCommuneLoaded.value);
          this.loadBlocZone();
        }
        this.isRouterActive.next(false);
      }
    });
  }

  ngOnInit() {
    this.loadZone();
    this.loadCollaborateur();
  }

  ngAfterViewInit() {
    /**this.blocSort.disableClear = true;
    this.dataSource.sort = this.blocSort;

    this.benefSort.disableClear = true;
    
    this.dataSourceBenef.sort = this.benefSort;

    this.parcelleSort.disableClear = true;
    
    this.dataSourceParcelle.sort = this.parcelleSort;*/
    this.dataSource.paginator = this.blocPaginator;
    this.dataSourceBenef.paginator = this.benefPaginator;
    this.dataSourceParcelle.paginator = this.parcellePaginator;

  }

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
          this.filterDataBloc.push(elem_bloc.nom_bloc);
        });
        // load benef
        this.loadZoneBloc();
        this.loadBenefBloc();
      }
    });
  }

  loadBenefBloc() {
    if (this.data_bloc.length > 0) {
      this.data_benef = [];
      this.data_bloc_parce = [];
      this.data_bloc_parce_all = [];

      this.data_bloc.forEach((elem_bloc, ind_bloc) => {
        let code_bloc = {
          code_bloc: elem_bloc.code_bloc
        }
        this.loadData.loadBlocParceAll(code_bloc).then(res_all_parce => {
          if (res_all_parce.values.length > 0) {
            res_all_parce.values.forEach(elem_all_parce => {
              this.data_bloc_parce_all.push(elem_all_parce);
            });
          }
        });
        this.loadData.loadBlocParce(code_bloc).then(parce_bloc => {
          console.log(parce_bloc);
          if (parce_bloc.values.length > 0) {
            parce_bloc.values.forEach(elem_blparc => {
              console.log(elem_blparc);
              elem_blparc.parcelle = [];
              this.data_bloc_parce.push(elem_blparc);
            });
          }
        });
        this.loadData.loadBenefBloc({code_bloc: elem_bloc.code_bloc}).then(res_benef => {
          res_benef.values.forEach(elem_benef => {
            this.data_benef.push(elem_benef);
          });
          // Fin du boucle
          if ((this.data_bloc.length - 1) === ind_bloc) {
            if (this.data_benef.length > 0) {
              this.data_benef.forEach(item_bnf => {
                item_bnf.parcelle = this.data_bloc_parce.filter(elem_parce => {return elem_parce.code_benef_bl === item_bnf.code_benef_bl});
              });
            }
            this.dataSourceBenef.data = this.data_benef;
            this.dataSourceParcelle.data = this.data_bloc_parce_all;
          }
        });
        // Fin du boucle
      });
    }
  }
  loadZoneBloc() {
    if (this.data_bloc.length > 0) {
      this.data_bloc_zone = [];
      this.data_bloc.forEach((elem_bloc, ind_bloc) => {
        this.loadData.loadBlocZone(elem_bloc.code_bloc).then(res_val => {
          if (res_val.values.length > 0) {
            res_val.values.forEach(elem_parce => {
              this.data_bloc_zone.push(elem_parce);
            });
            elem_bloc.zone = res_val.values;
          } else elem_bloc.zone = [];
          //
          if ((this.data_bloc.length - 1) === ind_bloc) {
            this.dataSource.data = this.data_bloc;
            this.loadExportBloc(this.data_bloc);
          }
        });
      });
    }
  }

  /**************************** 
   * LOAD export
   * ***********************/
  loadExportBloc(data_bloc: Loc_Bloc[]) {
    this.data_bloc_export = [];
    this.data_bloc_zone_export = [];
    data_bloc.forEach(elem_bloc => {
      this.data_bloc_export.push({
        'Code Bloc': elem_bloc.code_bloc,
        'Bloc': elem_bloc.nom_bloc,
        'Zone_district': elem_bloc.nom_dist,
        'Techinicien responsable': elem_bloc.nom + ' ' + elem_bloc.prenom
      });
    });
    this.data_bloc_zone.forEach(elem_zone => {
      this.data_bloc_zone_export.push({
        'Bloc': elem_zone.nom_bloc,
        'Commune': elem_zone.nom_com,
        'Fokontany': elem_zone.nom_fkt
      });
    });
  }
  loadExportBenef(data_: any) {

    if (data_.data_beneficiaire != undefined) {
      this.data_benef_export = [];
      let benef_export: Local_benef_activ_bl[] = data_.data_beneficiaire;

      benef_export.forEach(elem_benef => {
        this.data_benef_export.push({
          'Bloc': elem_benef.nom_bloc,
          'Code Beneficiaire': elem_benef.code_benef_bl_temp,
          'Code achat': elem_benef.code_achat,
          'Nom': elem_benef.nom,
          'Prenom': elem_benef.prenom,
          'Surnom': elem_benef.surnom,
          'Sexe': elem_benef.sexe,
          'Dt naissance': elem_benef.dt_nais != null?moment(elem_benef.dt_nais).format("DD/MM/YYYY"):elem_benef.dt_nais_vers,
          'CIN': elem_benef.cin,
          'Dt délivrance': elem_benef.dt_delivrance != null?moment(elem_benef.dt_delivrance):null,
          'Lieu délivrance': elem_benef.lieu_delivrance,
          'Contact': elem_benef.contact,
          'Commune de résidance': elem_benef.commune,
          'Fokontany': elem_benef.fokontany,
          'Nbr parcelle': elem_benef.nb_parce,
          'Somme Sfce parce': elem_benef.sum_parce
        });
      });
    } 

    if (data_.data_parcelle != undefined) {
      this.data_parce_export = [];
      let parcelle_export: Loc_Bloc_Parce_All[] = data_.data_parcelle;

      parcelle_export.forEach(elem_parce => {
        this.data_parce_export.push({
          'Bloc': elem_parce.bloc,
          'Code parce': elem_parce.code_parce_temp,
          'Code beneficiaire': elem_parce.code_benef_bl_temp,
          'Nom': elem_parce.prenom != null?elem_parce.nom.concat( ' ', elem_parce.prenom):elem_parce.nom,
          'Sexe': elem_parce.sexe,
          'Dt Naissance': elem_parce.dt_nais != null?moment(elem_parce.dt_nais).format("DD/MM/YYYY"):elem_parce.dt_nais_vers,
          'CIN': elem_parce.cin,
          'Localité benef': elem_parce.commune_parce + '-' + elem_parce.fokontany_benef,
          'Latitude': elem_parce.lat,
          'Longitude': elem_parce.log,
          'Sfce(m²)': elem_parce.superficie,
          'Fokontany': elem_parce.fokontany_parce,
          'Indication': elem_parce.indication
        });
      });
    }
  }

  applyFilterSelect(value: Loc_Bloc, table: string) {
    console.log("Selected filter " + value + " " + table);
    this.isClickedBloc = false;

    if (value != undefined) {
      const filterValue = value.code_bloc;
      let benef_filter = this.data_benef.filter(item_benef => {return item_benef.id_bloc === filterValue});
      let parce_filter = this.data_bloc_parce_all.filter(item_parce => {return item_parce.id_bloc === filterValue});

      if (table === 'bloc') {
        this.dataSource.filter = filterValue.trim();
      } else if(table === 'beneficiaire') {
        let data_export = {
          data_beneficiaire: benef_filter,
          data_parcelle: parce_filter
        }
        this.loadExportBenef(data_export);
        this.dataSourceBenef.filter = filterValue.trim();
      } else if (table === 'parcelle') {
        let data_export = {
          data_parcelle: parce_filter
        }
        this.loadExportBenef(data_export);
        this.dataSourceParcelle.filter = filterValue.trim();
      }
    }
  }
  applyFilterTout(table: string) {
    console.log("apply filter");
    this.isClickedBloc = false;
    let data_export = {
      data_beneficiaire: this.data_benef,
      data_parcelle: this.data_bloc_parce_all
    }
    this.loadExportBenef(data_export);

    if (table === 'bloc') {
      this.dataSource.filter = '';
      this.dataSource.data =  this.data_bloc;
    } else if (table === 'beneficiaire') {
      this.dataSourceBenef.filter = '';
      this.dataSourceBenef.data =  this.data_benef;      
    } else if (table === 'parcelle') {
      this.dataSourceParcelle.filter = '';
      this.dataSourceParcelle.data = this.data_bloc_parce_all;
    }
      this.selectedBloc = <Loc_Bloc>{};
  }
  /** ************************* 
   * EXPORT EXCELLE
   * **************************/
  onExport(parent: any) {
    switch(parent) {
      case 'bloc':
        let export_bloc: Loc_export_excel[] = [
          {
            data: this.data_bloc_export,
            name_feuille: 'Bloc',
            name_file: 'BLOC' + '_' + this.projet.ancronyme + '-' + this.user[this.user.length - 1].id_equipe + this.user[this.user.length - 1].nom
          },
          {
            data: this.data_bloc_zone_export,
            name_feuille: 'Zone Bloc',
            name_file: 'BLOC' + '_' + this.projet.ancronyme + '-' + this.user[this.user.length - 1].id_equipe + this.user[this.user.length - 1].nom
          }
        ]
        this.exportExcel.onExport(export_bloc);
        break;
      case 'beneficiaire':
        let export_benef: Loc_export_excel[] = [
          {
            data: this.data_benef_export,
            name_feuille: 'Beneficiaire',
            name_file: 'BL_Beneficaire_Parcelle' + '_' + this.projet.ancronyme + '-' + this.user[this.user.length - 1].id_equipe + this.user[this.user.length - 1].nom
          },
          {
            data: this.data_parce_export,
            name_feuille: 'Parcelle',
            name_file: 'BL_Beneficaire_Parcelle' + '_' + this.projet.ancronyme + '-' + this.user[this.user.length - 1].id_equipe + this.user[this.user.length - 1].nom
          }
        ]
        this.exportExcel.onExport(export_benef);
        break;
      case 'parcelle':
        let export_parce: Loc_export_excel[] = [
          {
            data: this.data_parce_export,
            name_feuille: 'Parcelle',
            name_file: 'BL_Parcelle' + '_' + this.projet.ancronyme + '-' + this.user[this.user.length - 1].id_equipe + this.user[this.user.length - 1].nom
          }
        ]
        this.exportExcel.onExport(export_parce);
        break;
    }
  }
  
  onFinish() {
    this.resfreshTb();
    let data_export = {
      data_beneficiaire: this.data_benef,
      data_parcelle: this.data_bloc_parce_all
    }
    this.loadExportBenef(data_export);
    
    this.isUpdate = false;
    this.isAddBenef = false;
    this.isEditRowBenef = false;
    this.indexEditRowBenef = null;
    this.update_benef = <Update_infos_benef>{};
    //Parce
    this.isAddParce = false;
    this.indexEditRowparce = null;
    this.isRowEditParce = false;
  }

  onUpdate() {
    this.isUpdate = true;
  }

  //Delete beneficiaire bloc
  onDeleteBenef(element: any) {
    let element_benf: Local_benef_activ_bl = element;
    console.log("::::Delete Bénéficiaire::::", element_benf);
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '500px',
      data: {
        elem_benef_bloc: element_benf
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result != undefined) {
        if (element_benf.etat_benef_bloc === SYNC) {
          console.log(":::SYNC Delete Beneficiaire Element:::::", element_benf);
          
          this.loadData.findParceBenefBloc(element_benf.code_benef).then(res_parce => {
            let data_parce: Find_parce_benf_bloc[] = res_parce.values;
            if (data_parce.length > 0) {
              data_parce.forEach((elem_parce, ind_parce) => {
                let code_parce = {
                  code_parce: elem_parce.code_parce
                }
                this.loadData.findMepParceBloc(elem_parce.code_parce).then(res_mep => {
                  let data_mep: Find_mep_parce_bloc[] = res_mep.values;
                  if (data_mep.length > 0) {
                    data_mep.forEach((elem_mep, ind_mep) => {
                      let code_mep = {
                        code_mep: elem_mep.code_culture
                      }
                      this.loadData.findSuiviMepBloc(elem_mep.code_culture).then(res_suivi => {
                        let data_suivi: any[] = res_suivi.values;
                        if (data_suivi.length > 0) {
                          this.crudDb.deleteSuiviBloc(code_mep).then(res_del_suivi => {
                            this.crudDb.deleteMepBloc(code_mep).then(result => {
                              // Fin du boucle
                              if ((data_mep.length - 1) === ind_mep) {
                                // Delete parcelle
                                this.crudDb.deleteParceBloc(code_parce).then(res => {
                                    // Fin du boucle
                                  if ((data_parce.length - 1) === ind_parce) {
                                    this.crudDb.deleteBenefBloc(element_benf.code_benef_bl).then(res_del => {
                                      this.resfreshTb();
                                    });
                                  }
                                });
                              }
                            });
                          });
                        } else {
                          // 
                          this.crudDb.deleteMepBloc(code_mep).then(result => {
                            // Fin du boucle
                            if ((data_mep.length - 1) === ind_mep) {
                              // Delete parcelle
                              this.crudDb.deleteParceBloc(code_parce).then(res => {
                                // Fin du boucle
                                if ((data_parce.length - 1) === ind_parce) {
                                  this.crudDb.deleteBenefBloc(element_benf.code_benef_bl).then(res_del => {
                                    this.resfreshTb();
                                  });
                                }
                              });
                            }
                          });
                        }
                      });
                    });
                  } else {
                    // Delete parcelle
                    this.crudDb.deleteParceBloc(code_parce).then(res => {
                        // Fin du boucle
                        if ((data_parce.length - 1) === ind_parce) {
                          this.crudDb.deleteBenefBloc(element_benf.code_benef_bl).then(res_del => {
                            this.resfreshTb();
                          });
                        }
                    });
                  }
                });
              })
            } else {
              this.crudDb.deleteBenefBloc(element_benf.code_benef_bl).then(res_del => {
                this.resfreshTb();
              });
            }
          });
        } else if (element_benf.etat_benef_bloc === VALIDE) {
    
        }
      }
    });
  }

  // Delete Parcelle
  onDeleteParce(element: any) {
    let element_parce: Local_bloc_parce = element;
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '500px',
      data: {
        elem_parce_bloc: element_parce
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result != undefined) {
        if (element_parce.etat === SYNC) {
          let code_parce = {
            code_parce: element_parce.code_parce
          }
          this.loadData.findMepParceBloc(element_parce.code_parce).then(res_mep => {
            let data_mep: Find_mep_parce_bloc[] = res_mep.values;
            if (data_mep.length > 0) {
              data_mep.forEach((elem_mep, ind_mep) => {
                let code_mep = {
                  code_mep: elem_mep.code_culture
                }
                this.loadData.findSuiviMepBloc(elem_mep.code_culture).then(res_suivi => {
                  let data_suivi: any[] = res_suivi.values;
                  if (data_suivi.length > 0) {
                    this.crudDb.deleteSuiviBloc(code_mep).then(res_del_suivi => {
                      this.crudDb.deleteMepBloc(code_mep).then(result => {
                        // Fin du boucle
                        if ((data_mep.length - 1) === ind_mep) {
                          // Delete parcelle
                          this.crudDb.deleteParceBloc(code_parce).then(res => {
                            this.resfreshTb();
                          });
                        }
                      });
                    });
                  } else {
                    // 
                    this.crudDb.deleteMepBloc(code_mep).then(result => {
                      // Fin du boucle
                      if ((data_mep.length - 1) === ind_mep) {
                        // Delete parcelle
                        this.crudDb.deleteParceBloc(code_parce).then(res => {
                          this.resfreshTb();
                        });
                      }
                    });
                  }
                });
              });
            } else {
              // Delete parcelle
              this.crudDb.deleteParceBloc(code_parce).then(res => {
                this.resfreshTb();
              });
            }
          });
        } else if (element_parce.etat === VALIDE) {
    
        } else {
          
        }
      }
    });
  }

  // save pms
  onCancelAddBenef(data: any) {
    if (data.src === 'add') {
      this.isAddBenef = false;
      this.update_benef = <Update_infos_benef>{};
    } else if (data.src === 'edit') {
      this.isEditRowBenef = false;
      this.update_benef = <Update_infos_benef>{};
      this.indexEditRowBenef = null;
    }
  }
  onSaveAddBenef(data: any) {
    let img_cin: string[] = [];
    if (this.update_benef.img_cin_1.data != null) {
      img_cin.push(this.update_benef.img_cin_1.data);
    } 
    
    if (this.update_benef.img_cin_2.data != null) {
      img_cin.push(this.update_benef.img_cin_2.data);
    }
    let data_to_add: UpdateBenef = {
      code_benef: null,
      img_benef: this.update_benef.img_pr != null? this.update_benef.img_pr.data: null,
      nom: this.update_benef.nom,
      prenom: this.update_benef.prenom,
      sexe: this.update_benef.sexe,             
      dt_nais: this.update_benef.dt_naissance,
      dt_nais_vers: this.update_benef.dt_naissance_vers,
      surnom: this.update_benef.surnom,
      cin: this.update_benef.cin,
      dt_delivrance: this.update_benef.dt_delivrance,
      lieu_delivrance: this.update_benef.lieu_delivrance,
      img_cin:  img_cin.length > 0? JSON.stringify(img_cin.join("-")):null,
      contact: this.update_benef.contact,
      id_fkt: this.update_benef.fokontany != null?this.update_benef.fokontany.code_fkt:null,
      id_commune: this.update_benef.village != null?this.update_benef.commune.code_com: null,
      village: this.update_benef.village,
      dt_Insert: null,
      etat: null,
      statut: null
    };
    let add_benef_bloc: UpdatedBenefBloc = {
      code_benef_bl: null,
      code_benef_bl_temp: null,
      id_proj: this.projet.code_proj,
      id_activ: this.activite.id_activ,
      id_benef: null,
      id_bloc: this.update_benef.bloc != null?this.update_benef.bloc.code_bloc:null,
      code_achat: this.update_benef.code_achat,
      id_collaborateur: this.update_benef.collaborateur != null?this.update_benef.collaborateur.id_col:null,
      etat: null,
      status: null
    }
    if (data.src === 'add') {
      let code_benef: string = this.user[this.user.length - 1].id_equipe + '-' + 'B' + '-' + moment().format('YYYYMMDD-HHmmss');
      let order_benef: number = 0;

      data_to_add.code_benef = code_benef;
      data_to_add.dt_Insert = moment().format("YYYY-MM-DD");
      data_to_add.etat = SYNC;
      data_to_add.statut = ACTIVE;

      this.loadData.generateCodeBenefBloc({code_bloc: this.update_benef.bloc.code_bloc}).then(res_benef => {
        let temp_benef_code: Loc_generate_code_benef[] = [];

        temp_benef_code = res_benef.values;
        console.log(":::Beneficiaire Code:::", temp_benef_code);
        if (temp_benef_code.length > 0) {
          let last_code_benef = temp_benef_code[temp_benef_code.length - 1].code_benef_bl_temp;
          let array_code_benef = last_code_benef.split("-");
          let last_order_benef: number = parseInt(array_code_benef[array_code_benef.length - 1]);
          order_benef =  last_order_benef + 1;
        } else order_benef = 1;
        //console.log(":::Code Order Beneficiaire:::", order_benef);

        this.crudDb.AddBenef_(data_to_add).then(res_benef_info => {
          let order_code = order_benef < 100?order_benef < 10?'00'.concat(order_benef.toString()):'0'.concat(order_benef.toString()):order_benef.toString();
          let code_benef_bl: string = 'B' + '-' + this.update_benef.bloc.ordre + this.update_benef.bloc.ancronyme + '-' + moment().format('YYYYMMDD-HHmmss');
          let code_benef_bl_temp: string = 'B' + '-' + this.update_benef.bloc.ordre + this.update_benef.bloc.ancronyme + '-' + order_code;
          add_benef_bloc.code_benef_bl = code_benef_bl;
          add_benef_bloc.code_benef_bl_temp = code_benef_bl_temp;
          add_benef_bloc.id_benef = code_benef;
          add_benef_bloc.etat = SYNC;
          add_benef_bloc.status = ACTIVE;
          console.log(":::::Benef bloc ToAdd Data:::", add_benef_bloc);
          this.crudDb.AddBenefBl(add_benef_bloc).then(insert_benef => {
            this.loadData.loadBenefBloc({code_benef: add_benef_bloc.code_benef_bl}).then(res_benef_bl => {
              if (res_benef_bl.values.length > 0) {
                res_benef_bl.values[0].parcelle = [];
                this.dataSourceBenef.data = [res_benef_bl.values[0], ...this.dataSourceBenef.data];
              }
            });
            console.log("Benef Added");
            this.isAddBenef = false;
            this.update_benef = <Update_infos_benef>{};
          });
        });
      });
    } else if (data.src === 'edit') {
      console.log("Edit info benef:::", data_to_add);
      console.log("Edit Activiter:::", add_benef_bloc);
      let elem_benef: Local_benef_activ_bl = data.elem_benef;
      data_to_add.code_benef = elem_benef.code_benef;
      data_to_add.etat = elem_benef.etat_bnf === SYNC?SYNC:UPDATE;
      data_to_add.statut = ACTIVE;
      this.crudDb.UpdateBenef(data_to_add).then(res_benef_info => {
        add_benef_bloc.code_benef_bl = elem_benef.code_benef_bl;
        add_benef_bloc.code_benef_bl_temp = elem_benef.code_benef_bl_temp;
        add_benef_bloc.id_benef = elem_benef.id_benef;
        add_benef_bloc.etat = elem_benef.etat_benef_bloc === SYNC?SYNC:UPDATE;
        add_benef_bloc.status = ACTIVE;
        let update_data = {
          isUpdateBenefBloc: true,
          data_benef_bl: add_benef_bloc
        }
        this.crudDb.UpdateBenefBl(update_data).then(up_benef_bl => {
          this.resfreshTb();
          this.isEditRowBenef = false;
          this.update_benef = <Update_infos_benef>{};
          this.indexEditRowBenef = null;
        });
      });
    }
  }
  /*******************
   * Save parce
   *****************/
   onCancelParce(data: any) {
    if (data.src === 'add') {
      this.isAddParce = false;
      this.indexEditRowBenef = null;
    } else if (data.src === 'edit') {
      this.indexEditRowparce = null;
      this.indexEditRowBenef = null;
      this.isRowEditParce = false;
    }
  }
  onSaveParce(data: any) {
    let element_bnf: Local_benef_activ_bl = data.elem_benef;
    let num_parce: string = '';
    console.log(":::DATA Parce:::", this.update_parce);

    let add_parce: UpdateParceBloc = {
      code_parce: null,
      code_parce_temp: null,
      id_bloc: this.update_parce.bloc != null?this.update_parce.bloc.code_bloc:null,
      id_benef: element_bnf.id_benef,
      ref_gps: this.update_parce.ref_gps,
      lat: this.update_parce.latitude,
      log: this.update_parce.longitude,
      superficie: this.update_parce.superficie,
      id_fkt: this.update_parce.fokontany != null?this.update_parce.fokontany.code_fkt:null,
      id_commune: this.update_parce.village != null && this.update_parce.fokontany == null?this.update_parce.commune.code_com:null,
      village: this.update_parce.village,
      anne_adheran: null,
      indication: this.update_parce.indication,
      etat: null,
      status: null
    }
    if (this.update_parce.code_parce_temp < 100) {
      if (this.update_parce.code_parce_temp < 10) {
        num_parce = '00';
      } else {
        num_parce = '0';
      }
    }
    if (data.src === 'add') {
      let code_parce: string = this.update_parce.bloc.ordre + this.update_parce.bloc.ancronyme + '-' + moment().format('YYYYMMDD-HHmmss');
      add_parce.code_parce = code_parce;
      add_parce.code_parce_temp = this.update_parce.bloc.ordre + this.update_parce.bloc.ancronyme + '-' + num_parce + this.update_parce.code_parce_temp;// A refaire
      add_parce.etat = SYNC;
      add_parce.status = ACTIVE;

      this.crudDb.AddParceBloc(add_parce).then(res_ => {
        console.log("::::Parcelle Added:::", res_);
        this.loadData.loadBlocParce({code_benef_bl: element_bnf.code_benef_bl}).then(parce_bloc => {
          console.log(parce_bloc);
          if (parce_bloc.values.length > 0) {
            this.dataSourceBenef.data.forEach(src_bnf => {
              if (src_bnf.code_benef_bl === element_bnf.code_benef_bl) {
                src_bnf.parcelle = parce_bloc.values;
              }
            });
          }
        });
      });
      this.isAddParce = false;
      this.indexEditRowBenef = null;
    } else if (data.src === 'edit') {
      /**
       * Edit
       */
      let elem_parce_bl: Local_bloc_parce = data.elem_parce;
      add_parce.code_parce = elem_parce_bl.code_parce;
      add_parce.code_parce_temp = this.update_parce.bloc.ordre + this.update_parce.bloc.ancronyme + '-' + num_parce + this.update_parce.code_parce_temp;// A refaire
      add_parce.etat = elem_parce_bl.etat === SYNC?SYNC:UPDATE;
      add_parce.status = ACTIVE;
      let data_update = {
        isUpdateParceBl: true,
        data_parce_bl: add_parce
      }
      
      this.crudDb.UpdateParceBl(data_update).then(res => {
        this.loadData.loadBlocParce({code_benef_bl: element_bnf.code_benef_bl}).then(parce_bloc => {
          console.log(parce_bloc);
          if (parce_bloc.values.length > 0) {
            this.dataSourceBenef.data.forEach(src_bnf => {
              if (src_bnf.code_benef_bl === element_bnf.code_benef_bl) {
                src_bnf.parcelle = parce_bloc.values;
              }
            });
          }
          this.indexEditRowparce = null;
          this.indexEditRowBenef = null;
          this.isRowEditParce = false;
        });
      });
    }
  }

  async resfreshTb() {
    const loading = await this.loadingCtrl.create();
    await loading.present();
    this.loadBenefBloc();
    setTimeout(() => {
      this.dataSourceBenef.data = this.data_benef;
      this.loadingCtrl.dismiss();
    }, 500);
  }
  async onUpdatedParce(data: any) {
    //{src: 'add', data_pr: element, index_: i}
    let data_: any;
    if (data.src === 'add') {
      data_ = {
        isParceBl: true,
        isAddCep: true,
        zone: {
          region: this.data_region,
          district: this.data_district,
          commune: this.data_commune,
          fokontany: this.data_fokontany
        },
        bloc: this.data_bloc,
        elem_benef: data.data_benef
      }
    } else if (data.src === 'edit') {
      //{src: 'edit', data_benef: element, data_parce: row, index_parce: inde, index_benef: i}
      let elem_parce: Local_bloc_parce = data.data_parce;
      if (elem_parce.code_parce_temp != null) {
        let array_code_parce_temp = elem_parce.code_parce_temp.split("-");
        elem_parce.code_parce_temp = array_code_parce_temp[array_code_parce_temp.length - 1];
      }
      data_ = {
        isParceBl: true,
        isEditCep: true,
        zone: {
          region: this.data_region,
          district: this.data_district,
          commune: this.data_commune,
          fokontany: this.data_fokontany
        },
        bloc: this.data_bloc,
        elem_benef: data.data_benef,
        elem_parce: elem_parce
      }
    }
    let modal = await this.modalCtrl.create({
      component: ModalPrPage,
      cssClass: 'modal-custum-pr',
      backdropDismiss: true,
      componentProps: data_
    });
    modal.onDidDismiss().then(modal_data => {
      console.log("::::Data Parce Dismissed:::", modal_data.data);
      if (modal_data.data != undefined) {
        this.update_parce = modal_data.data;
        if (data.src === 'add') {
          this.isAddParce = true;
          this.indexEditRowBenef = data.index_;
        } else if (data.src === 'edit') {
          this.indexEditRowparce = data.index_parce;
          this.indexEditRowBenef = data.index_benef;
          this.isRowEditParce = true;
        }
      }
    });
    await modal.present();
  }

  async onUpdateBenef(data: any) {
    let data_: any;
    if (data.src === 'add') {
      data_ = {
        isBenefBloc: true,
        isAdd: true,
        zone: {
          region: this.data_region,
          district: this.data_district,
          commune: this.data_commune,
          fokontany: this.data_fokontany
        },
        bloc: this.data_bloc,
        collaborateur: this.data_collaborateur
      }
    } else if (data.src === 'edit') {
      data_ = { 
        isBenefBloc: true,
        isEdit: true,
        zone: {
          region: this.data_region,
          district: this.data_district,
          commune: this.data_commune,
          fokontany: this.data_fokontany
        },
        bloc: this.data_bloc,
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
        this.update_benef = data_modal.data;
        this.update_benef.dt_naissance = data_modal.data.dt_naissance != null? data_modal.data.dt_naissance.format("YYYY-MM-DD"): data_modal.data.dt_naissance;
        this.update_benef.dt_delivrance = data_modal.data.dt_delivrance != null? data_modal.data.dt_delivrance.format("YYYY-MM-DD"): data_modal.data.dt_delivrance;
        
        if (data.src === 'add') {
          this.isAddBenef = true;
        } else if (data.src === 'edit') {
          this.isEditRowBenef = true;
          this.indexEditRowBenef = data.ind_benef;
        }
      }
    });
    await modal.present();
  }

  // Show Img
  async onViewImage(elem_bl: Local_benef_activ_bl) {
    let modal =  await this.modalCtrl.create({
      component: VisualiseurImagePage,
      cssClass: 'custom-view-img',
      backdropDismiss: true,
      componentProps: {
        isImgCinBL: true,
        elem_bl: elem_bl
      }
    });
    modal.onDidDismiss().then(modal_data => {
      if (modal_data != undefined) {
        
      }
    });
    await modal.present();
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

  // load Collabvorateur
  loadCollaborateur() {
    console.log(":::::activite::::", this.activite);
    this.loadData.loadCollaborateursActivite(this.activite.id_activ).then(res => {
      this.data_collaborateur = res.values;
    });
  }

  onRowClickedBloc(data: any) {
    this.isClickedBloc = true;
    this.data_bloc_zone = [];
    console.log(data);
    this.loadData.loadBlocZone(data.code_bloc).then(res_val => {
      console.log(res_val);
      if (res_val.values.length > 0) {
        res_val.values.forEach(elem_bloc_zone => {
          this.data_bloc_zone.push(elem_bloc_zone);
        });
        this.dataSourceZone.data = this.data_bloc_zone;
        console.log(this.dataSourceZone.data);
        console.log(this.data_bloc_zone);
      }
    });
  }

  onRowBenefClicked(data: any) {
    console.log(data);
    let data_bloc_parce_benef: Local_bloc_parce[] = [];
    let code_benef = {
      code_benef_bl: data.code_benef_bl
    }
    this.isClickedBenef = true;
    this.loadData.loadBlocParce(code_benef).then(parce_benef => {
      console.log(parce_benef);
      if (parce_benef.values.length > 0) {
        parce_benef.values.forEach(elem_blparc => {
          console.log(elem_blparc);
          data_bloc_parce_benef.push(elem_blparc);
        });
        this.dataSourceParceBenef.data = data_bloc_parce_benef;
      } else this.dataSourceParceBenef.data = data_bloc_parce_benef;
    });
  }

  onClose() {
    if (this.isClickedBloc) {
      this.isClickedBloc = false;
    }

    if (this.isClickedBenef) {
      this.isClickedBenef = false;
    }
  }

  onToggleTableRows(data: any) {
    if (data === 'beneficiaire') {
      this.isTableBenefExpanded = !this.isTableBenefExpanded;
      this.dataSourceBenef.data.forEach(row => {
        if (row.parcelle.length > 0) {
          row.isExpanded = this.isTableBenefExpanded;
        } else {
          if (row.isExpanded) {
            row.isExpanded = false;
          }
        }
      });
    }
  }

  selectMatTab(index: number) {
    console.log("index Mat-Tab Selected : " + index);
    this.initData();
    if (index == 0) {
      this.dataSource.filter = '';
      this.dataSource.data = this.data_bloc;
    } else if (index == 1) { 
      setTimeout(async () => {
        const loading = await this.loadingCtrl.create();
        await loading.present();
        let data_export = {
          data_beneficiaire: this.data_benef,
          data_parcelle: this.data_bloc_parce_all
        }
        this.loadExportBenef(data_export);
        this.dataSourceBenef.filter = ''; 
        this.dataSourceBenef.data = this.data_benef;
        this.loadingCtrl.dismiss();
      }, 500);
    } else if(index == 2) {
      let data_export = {
        data_parcelle: this.data_bloc_parce_all
      }
      this.loadExportBenef(data_export);
      this.dataSourceParcelle.filter = '';
      this.dataSourceParcelle.data = this.data_bloc_parce_all;
    }
  }

  initData() {
    this.isClickedBloc = false;
    this.isClickedBenef = false;
    this.data_bloc_zone = [];
    this.selectedBloc = <Loc_Bloc>{};
  }

  onClick() {
    this.router.navigate(['homes']);
  }

}

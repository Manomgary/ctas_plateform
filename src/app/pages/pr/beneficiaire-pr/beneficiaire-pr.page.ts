import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { LoadingController, ModalController } from '@ionic/angular';
import { UpdateBenef, UpdateBenefActivPr, UpdateParcePr } from 'src/app/interfaces/interface-insertDb';
import { Code_pr_temp, Find_animationPR, Find_cepPR, Find_mep_cep, LocalFile, Loc_activ_projet, Loc_cep_PR, Loc_code_cep_PR, Loc_collaborateur, Loc_Commune, Loc_district, Loc_export_excel, Loc_Fokontany, Loc_PR, Loc_projet, Loc_region, Update_infos_benef } from 'src/app/interfaces/interfaces-local';
import { CrudDbService } from 'src/app/services/local/crud-db.service';
import { LoadDataService } from 'src/app/services/local/load-data.service';
import { Utilisateurs } from 'src/app/utils/interface-bd';
import { ModalPrPage } from '../../modals/modal-pr/modal-pr.page';

import { ACTIVE, SYNC, UPDATE, VALIDE } from 'src/app/utils/global-variables';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ExportExcelService } from 'src/app/services/export-excel.service';
import * as _moment from 'moment';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from 'src/app/component/dialog/dialog.component';
import { VisualiseurImagePage } from '../../modals/visualiseur-image/visualiseur-image.page';
const moment = _moment;

interface BlocEquipe {
  code_bloc: string, 
  nom: string, 
  ancronyme: string, 
  id_prjt: string, 
  id_tech: string, 
  status: string
}
interface Update_Cep {
  bloc: BlocEquipe,
  ref_gps: string,
  latitude: number,
  longitude: number,
  superficie: number,
  region: Loc_region,
  district: Loc_district,
  commune: Loc_Commune,
  fokontany: Loc_Fokontany,
  village: string
}

@Component({
  selector: 'app-beneficiaire-pr',
  templateUrl: './beneficiaire-pr.page.html',
  styleUrls: ['./beneficiaire-pr.page.scss'],
  animations: [ //utiliser pour @detailExpand (table expendable)
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ])
  ]
})
export class BeneficiairePrPage implements OnInit {

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

  private projet: Loc_projet;
  private user: Utilisateurs[];
  private activite: Loc_activ_projet;

  private data_pr: Loc_PR[] = [];
  private data_parce: Loc_cep_PR[] = [];

  displayedColumnsPR: string[] = ['img_pr', 'code_pr', 'code_achat', 'nom', 'surnom', 'sexe', 'dt_nais', 'cin', 'img_cin', 'commune', 'fokontany', 'action'];
  displayedAddColumnsPR: string[] = ['new_img_pr', 'new_code_pr', 'new_code_achat', 'new_nom', 'new_surnom', 'new_sexe', 'new_dt_nais', 'new_cin', 'new_img_cin', 'new_commune', 'new_fokontany', 'new_action'];
  displayedColumnsParce: string[] = ['code_parce', 'bloc', 'ref_gps', 'lat', 'log', 'superficie', 'region', 'district', 'commune', 'fokontany'];
  displayedColumnsAddParce = ['new_code_parce', 'new_bloc', 'new_ref_gps', 'new_lat', 'new_log', 'new_superficie', 'new_region', 'new_district', 'new_commune', 'new_fokontany', 'new_action'];

  // data source Mep
  dataSourcePR = new MatTableDataSource<Loc_PR>();
  dataSourceParce = new MatTableDataSource<Loc_cep_PR>();

  data_collaborateur: Loc_collaborateur[] = [];

  isTablePRExpanded = false;
  isAddPr: boolean = false;
  isAddCep: boolean = false;

  isUpdate = false;
  indeRowEdit: number;
  indeRowEditCep: number;
  isRowEdit = false;
  isRowEditCep = false;

  data_region: Loc_region[] = [];
  data_district: Loc_district[] = [];
  data_commune: Loc_Commune[] = [];
  data_fokontany: Loc_Fokontany[] = [];

  data_bloc: BlocEquipe[] = [];

  isAutresFkt: boolean = false;
  private update_cep: Update_Cep = <Update_Cep>{};

  private data_pr_export: any[] = [];
  private data_parce_export: any[] = [];

  etat_sync = SYNC;
  etat_valide = VALIDE;
  etat_update = UPDATE;

  constructor(
      private router: Router,
      private loadService: LoadDataService,
      private modalCtrl: ModalController,
      private crudService: CrudDbService,
      private formBuilder: FormBuilder,
      private loadingCtrl: LoadingController,
      private exportExcel: ExportExcelService,
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
          this.loadPRBloc();
          console.log(":::Projet:::", this.projet);
          console.log(":::USers::::", this.user);
          console.log(":::Activiter::::", this.activite);
        }
     }

  async ngOnInit() {
    const loading = await this.loadingCtrl.create();
    await loading.present();
    this.loadCollabo();
    this.loadZone();
    setTimeout(async () => {
      this.loadingCtrl.dismiss();
    }, 200);
  }

  ionViewDidEnter() {
    console.log(":::::LifeCycle Suivi function:::: ionViewDidEnter:::");
  }

  onFinish() {
    
    setTimeout(async () => {
      const loading = await this.loadingCtrl.create();
      await loading.present();
      this.isUpdate = false;
      this.isAddPr = false;
      this.isAddCep = false;
      if (this.isRowEdit) {
        this.isRowEdit = false;
        this.indeRowEdit = null;
      }
      if (this.isRowEditCep) {
        this.indeRowEditCep = null;
        this.isRowEditCep = false;
        this.indeRowEdit = null;
      }
      this.update_cep = <Update_Cep>{};
      this.initUpdatedBenef();
      // remov last element 
      this.displayedColumnsParce.pop();
      this.loadingCtrl.dismiss();
    }, 300);
  }

  onExport() {
    let data_To_Export: Loc_export_excel[] = [
      {
        data: this.data_pr_export,
        name_feuille: 'PR',
        name_file: 'PR' + '_'  + this.projet.ancronyme + this.user[this.user.length - 1].id_equipe + ' ' + this.user[this.user.length - 1].nom + this.user[this.user.length - 1].prenom
      },
      {
        data: this.data_parce_export,
        name_feuille: 'CEP',
        name_file: 'PR' + '_' + this.projet.ancronyme + this.user[this.user.length - 1].id_equipe + ' ' + this.user[this.user.length - 1].nom + this.user[this.user.length - 1].prenom
      }
    ]
    this.exportExcel.onExport(data_To_Export);
  }

  /***********************
  * Exporter CEP
  ***********************/
 loadExportPR(data_export_pr: Loc_PR[]) {
  this.data_pr_export = [];
  this.data_parce_export = [];

  if (data_export_pr.length > 0) {
    data_export_pr.forEach((elem_pr, ind_pr) => {
      let parce_pr = elem_pr.cep_pr;
      this.data_pr_export.push({
        'Code_PR': elem_pr.code_pr_temp,
        'Code Achat': elem_pr.code_achat,
        'Nom': elem_pr.prenom != null?elem_pr.nom + ' ' + elem_pr.prenom:elem_pr.nom,
        'Surnom':  elem_pr.surnom,
        'Sexe': elem_pr.sexe,
        'Dt Naiss': elem_pr.dt_nais != null?moment(elem_pr.dt_nais).format("DD/MM/YYYY"):elem_pr.dt_nais_vers,
        'CIN':  elem_pr.cin,
        'Dt Délivrance': elem_pr.dt_delivrance != null?moment(elem_pr.dt_delivrance).format("DD/MM/YYYY"):elem_pr.dt_delivrance,
        'Lieu délivrance': elem_pr.lieu_delivrance,
        'Commune': elem_pr.commune,
        'Fokontany':  elem_pr.fokontany,
        'Contact': elem_pr.contact,
        'Technicien Responsable': this.user[this.user.length - 1].prenom != null?this.user[this.user.length - 1].nom + ' ' + this.user[this.user.length - 1].prenom:this.user[this.user.length - 1].nom
      });
      if (parce_pr.length > 0) {
        parce_pr.forEach(elem_parce => {
          this.data_parce_export.push({
            'Code Parce': elem_parce.code_parce_temp,
            'Code PR': elem_pr.code_pr_temp,
            'Nom': elem_pr.prenom != null?elem_pr.nom + ' ' + elem_pr.prenom:elem_pr.nom,
            'Sexe': elem_pr.sexe,
            'Dt Nais':  elem_pr.dt_nais != null?moment(elem_pr.dt_nais).format("DD/MM/YYYY"):elem_pr.dt_nais_vers,
            'CIN': elem_pr.cin,
            'Lat': elem_parce.lat,
            'Log': elem_parce.log,
            'Sfce(m²)': elem_parce.superficie,
            'Commune_cep': elem_parce.commune,
            'Fokontany_cep': elem_parce.fokontany,
            'Bloc': elem_parce.bloc_cep
          });
        });
      }
    });
  }
 }


  onUpdate() {
    this.isUpdate = true;
    //Unshift(value) -> Add an elemen to the beginning of an array
    // push element array in specific position
    //this.displayedColumnsParce.splice(6, 0, 'region', 'district');
    this.displayedColumnsParce.push('action');
    //this.displayedColumnsParce = ['code_parce', 'bloc', 'ref_gps', 'lat', 'log', 'superficie', 'region', 'district', 'commune', 'fokontany', 'action'];
  }

  onEdit(data_: any) {
    console.log(":::Data edit:::", data_);
    this.indeRowEdit = data_.index_;
    let _data_: any = {
      src: 'edit', 
      element: data_.data
    };
    this.onPresentModal(_data_);
  }

  // Delete
  onDeleteBenef(element: any) {
    let elem_benef_pr: Loc_PR = element;
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '500px',
      data: {
        elem_benef_pr: elem_benef_pr
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result != undefined) {
        if (elem_benef_pr.etat_pr === SYNC) {
          // Find Champs Ecole
          this.loadService.findCepPR(elem_benef_pr.id_benef).then(res_cep => {
            let data_cep: Find_cepPR[] = res_cep.values;
            if (data_cep.length > 0) {
              data_cep.forEach((elem_cep, ind_cep) => {
                // Find MEP
                this.loadService.findMepCepPR(elem_cep.code_parce).then(res_mep => {
                  let data_mep: Find_mep_cep[] = res_mep.values;
                  if (data_mep.length > 0) {
                    data_mep.forEach((elem_mep, ind_mep) => {
                      let code_mep = {
                        code_mep: elem_mep.code_culture
                      }
                      this.loadService.findSuiviMepPR(code_mep).then(res_suivi_mep => {
                        if (res_suivi_mep.values.length > 0) {
                          this.crudService.deleteSuiviMepPR(code_mep).then(res_del => {
                            this.crudService.deleteMepPR(code_mep).then(res_del => {
                              // Fin du boucle
                              if ((data_mep.length - 1) === ind_mep) {
                                // delete CEP
                                this.crudService.deleteCepPR(elem_cep.code_parce).then(res_del => {
                                  // Fin du boucle
                                  if ((data_cep.length - 1) === ind_cep) {
                                    this.deleteAnimeVePR(elem_benef_pr.code_pr);
                                  }
                                });        
                              }
                            });
                          });
                        } else {
                          this.crudService.deleteMepPR(code_mep).then(res_del => {
                            // Fin du boucle
                            if ((data_mep.length - 1) === ind_mep) {
                              // delete CEP
                              this.crudService.deleteCepPR(elem_cep.code_parce).then(res_del => {
                                // Fin du boucle
                                if ((data_cep.length - 1) === ind_cep) {
                                  this.deleteAnimeVePR(elem_benef_pr.code_pr);
                                }
                              });         
                            }
                          });
                        }
                      });
                    });
                  } else {
                    // delete CEP
                    this.crudService.deleteCepPR(elem_cep.code_parce).then(res_del => {
                      // Fin du boucle
                      if ((data_cep.length - 1) === ind_cep) {
                        this.deleteAnimeVePR(elem_benef_pr.code_pr);
                      }
                    });
                  }
                });
              });
            } else {
              this.deleteAnimeVePR(elem_benef_pr.code_pr);
            }
          });
        }
      }
    });
  }
  onDeleteCep(elem: any) {
    let elem_cep: Loc_cep_PR = elem;
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '500px',
      data: {
        elem_cep_pr: elem_cep
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result != undefined) {
        if (elem_cep.etat === SYNC) {
          this.loadService.findMepCepPR(elem_cep.code_parce).then(res_mep => {
            let data_mep: Find_mep_cep[] = res_mep.values;
            if (data_mep.length > 0) {
              data_mep.forEach((elem_mep, ind_mep) => {
                let code_mep = {
                  code_mep: elem_mep.code_culture
                }
                this.loadService.findSuiviMepPR(code_mep).then(res_suivi_mep => {
                  if (res_suivi_mep.values.length > 0) {
                    this.crudService.deleteSuiviMepPR(code_mep).then(res_del => {
                      this.crudService.deleteMepPR(code_mep).then(res_del => {
                        // Fin du boucle
                        if ((data_mep.length - 1) === ind_mep) {
                          // delete CEP
                          this.crudService.deleteCepPR(elem_cep.code_parce).then(res => {
                            this.loadPRBloc();
                          });            
                        }
                      });
                    });
                  } else {
                    this.crudService.deleteMepPR(code_mep).then(res_del => {
                      // Fin du boucle
                      if ((data_mep.length - 1) === ind_mep) {
                        // delete CEP
                        this.crudService.deleteCepPR(elem_cep.code_parce).then(res => {
                          this.loadPRBloc();
                        });            
                      }
                    });
                  }
                });
              });
            } else {
              // delete CEP
              this.crudService.deleteCepPR(elem_cep.code_parce).then(res => {
                this.loadPRBloc();
              });
            }
          });
        }
      }
    });
  }
  deleteAnimeVePR(code_pr) {
    // Find Animation
    this.loadService.findAnimationVePR(code_pr).then(res_animation => {
      let data_anime: Find_animationPR[] = res_animation.values;
      if (data_anime.length > 0) {
        data_anime.forEach((elem_anime, ind_anime) => {
          //Find Speculation Anime
          this.loadService.findSpecuAnime(elem_anime.code_anime).then(res_specu => {
            if (res_specu.values.length > 0) {
              // Delete specu Anime
              this.crudService.deleteSpecuAnimeVe(elem_anime.code_anime).then(res_del => {
                // Delete anime
                this.crudService.deleteAnimationVe(elem_anime.code_anime).then(res_delete => {
                  // Fin du boucle
                  if ((data_anime.length - 1) === ind_anime) {
                    // Delete PR
                    this.crudService.deletePR(code_pr).then(res_del => {
                      // refresh
                      this.loadPRBloc();
                    });
                  }
                });
              });
            } else {
              // Delete anime
              this.crudService.deleteAnimationVe(elem_anime.code_anime).then(res_delete => {
                // Fin du boucle
                if ((data_anime.length - 1) === ind_anime) {
                  // Delete PR
                  this.crudService.deletePR(code_pr).then(res_del => {
                    // refresh
                    this.loadPRBloc();
                  });
                }
              });
            }
          });
        });
      } else {
        // Delete PR
        this.crudService.deletePR(code_pr).then(res_del => {
          // refresh
          this.loadPRBloc();
        });
      }
    });
  }

  // Save Edit
  onSaveEdit(elem: any) {
    console.log("data::::", elem);
    console.log("Data to Update:::::::", this.update_benef);
    let data: Loc_PR = elem.data;
    // Request To update
    let img_cin: string[] = [];
    if (this.update_benef.img_cin_1.data != null) {
      img_cin.push(this.update_benef.img_cin_1.data);
    } 

    if (this.update_benef.img_cin_2.data != null) {
      img_cin.push(this.update_benef.img_cin_2.data);
    }

    console.log("===img cin length===>", img_cin.length);
    console.log("===img cin ARRAY STRING===>", img_cin.toString());

    
    let data_to_update: UpdateBenef = {
      code_benef: data.id_benef,
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
      dt_Insert: moment().format("YYYY-MM-DD"),
      etat: data.etat_pr === SYNC?SYNC:UPDATE,
      statut: ACTIVE
    };
    
    this.crudService.UpdateBenef(data_to_update).then(res => {
      let update_pr: UpdateBenefActivPr = {
        code_pr: data.code_pr,
        code_pr_temp: data.code_pr_temp,
        id_proj: this.projet.code_proj,
        id_activ: this.activite.id_activ,
        id_benef: data.id_benef,
        id_bloc: null,
        code_achat: this.update_benef.code_achat,
        id_collaborateur: data.id_collaborateur,
        id_tech: data.id_tech,
        etat: data.etat_pr === SYNC ? SYNC : UPDATE,
        status: ACTIVE
      }
      console.log(":::::Benef PR ToAdd Data:::", update_pr);
      this.crudService.UpdatePrBenef(update_pr).then(res => {
        this.loadPRBloc();
        this.initUpdatedBenef();
      });
    });
    this.isRowEdit = false;
    this.indeRowEdit = null;
  }
  onCancelEdit() {
    this.isRowEdit = false;
    this.indeRowEdit = null;
    this.initUpdatedBenef();
  }

  onSaveAddPr() {
    console.log(this.update_benef);
    let collaborateur: Loc_collaborateur = null;
    let code_benef: string = 'B' + '-' + this.user[this.user.length - 1].id_equipe + '-' + moment().format('YYYYMMDD-HHmmss');
    let img_cin: string[] = [];
    if (this.update_benef.img_cin_1.data != null) {
      img_cin.push(this.update_benef.img_cin_1.data);
    } 
    
    if (this.update_benef.img_cin_2.data != null) {
      img_cin.push(this.update_benef.img_cin_2.data);
    }

    console.log("===img cin length===>", img_cin.length);
    console.log("===img cin ARRAY STRING===>", img_cin.toString());

    
    let data_to_add: UpdateBenef = {
      code_benef: code_benef,
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
      dt_Insert: moment().format("YYYY-MM-DD"),
      etat: SYNC,
      statut: ACTIVE
    };

    this.data_collaborateur.forEach(elem => {
      if (elem.nom.trim().toUpperCase() === 'PR') {
        collaborateur = elem;
      }
    });

    console.log(":::::Benef ToAdd Data:::", data_to_add);
    this.crudService.AddBenef_(data_to_add).then(res => {
      let code_pr: string = collaborateur.ancronyme + '-' + this.user[this.user.length - 1].id_equipe + this.projet.ancronyme + '-' + moment().format('YYYYMMDD-HHmmss');
      let add_pr: UpdateBenefActivPr = {
        code_pr: code_pr,
        code_pr_temp: null,
        id_proj: this.projet.code_proj,
        id_activ: this.activite.id_activ,
        id_benef: code_benef,
        id_bloc: null,
        code_achat: this.update_benef.code_achat,
        id_collaborateur: collaborateur != null ? collaborateur.code_col : null,
        id_tech: this.user[this.user.length - 1].id_equipe,
        etat: SYNC,
        status: ACTIVE
      }
      // loadPr
      let data_code = {
        id_tech: this.user[this.user.length - 1].id_equipe,
        code_prj: this.projet.code_proj
      }
      this.loadService.loadCodePRBloc(data_code).then(res_code_pr => {
        let data_code_pr: Code_pr_temp[] = res_code_pr.values;
        let order_pr: number;
        let num_pr: string = '';

        if (data_code_pr.length > 0) {
          let last_code_pr = data_code_pr[data_code_pr.length - 1].code_pr_temp;
          let arr_code_pr = last_code_pr.split('-');
          order_pr = parseInt(arr_code_pr[arr_code_pr.length - 1]) + 1;
        } else order_pr = 1;

        if (order_pr < 100) {
          if (order_pr < 10) {
            num_pr = '00';
          } else num_pr = '0';
        }
        //
        add_pr.code_pr_temp = collaborateur.ancronyme + '-' + this.user[this.user.length - 1].id_equipe + this.projet.ancronyme + '-' + num_pr + order_pr;
        this.crudService.AddPrBenef(add_pr).then(res => {
          this.loadPRBloc();
          this.initUpdatedBenef();
        });
      });
    });
    this.isAddPr = false;
  }
  onCancelAddPr() {
    this.isAddPr = false;
    this.initUpdatedBenef();
  }
  // Add Cep
  onSaveAddCep(row) {
    this.isAddCep = false;
    this.indeRowEdit = null;

    let element: Loc_PR = row;
    console.log(":::DATA CEP:::", this.update_cep);

    let code_parce: string = 'CEP' + '-' + this.user[this.user.length - 1].id_equipe + this.projet.ancronyme + '-' + moment().format('YYYYMMDD-HHmmss');
    let add_cep: UpdateParcePr = {
      code_parce: code_parce,
      code_parce_temp: null,
      id_bloc: this.update_cep.bloc != null ? this.update_cep.bloc.code_bloc : null,
      id_benef: element.id_benef,
      ref_gps: this.update_cep.ref_gps,
      lat: this.update_cep.latitude,
      log: this.update_cep.longitude,
      superficie: this.update_cep.superficie,
      id_commune: this.update_cep.commune != null ? this.update_cep.commune.code_com : null,
      id_fkt: this.update_cep.fokontany != null ? this.update_cep.fokontany.code_fkt : null,
      village: this.update_cep.village,
      anne_adheran: null,
      dt_creation: moment().format('YYYY-MM-DD'),
      etat: SYNC,
      status: ACTIVE
    }
    console.log("Champ Ecole To Add:::", add_cep);
    let data_cep = {
      id_tech: this.user[this.user.length - 1].id_equipe,
      code_prj: this.projet.code_proj
    }
    this.loadService.loadCodeCepPR(data_cep).then(res_code_cep => {
      let order_cep: number;
      let num_cep: string = '';
      let data_code_cep: Loc_code_cep_PR[] = res_code_cep.values;
      if (data_code_cep.length > 0) {
        let last_code_cep = data_code_cep[data_code_cep.length - 1].code_parce_temp;
        let arr_code_cep = last_code_cep.split("-");
        order_cep = parseInt(arr_code_cep[arr_code_cep.length - 1]) + 1;
      } else order_cep = 1;

      if (order_cep < 100) {
        if (order_cep < 10) {
          num_cep = '00';
        } else num_cep = '0';
      }
      //
      add_cep.code_parce_temp = 'CEP' + '-' + this.user[this.user.length - 1].id_equipe + this.projet.ancronyme + '-' + num_cep + order_cep;
      
      this.crudService.AddParcellePr(add_cep).then(res => {
        this.loadPRBloc();
      });
    });
  }
  onCancelAddCep() {
    console.log(":::Added CEP:::", this.update_cep);
    this.isAddCep = false;
    this.indeRowEdit = null;
    this.update_cep = <Update_Cep>{};
  }

  // Edit Cep
  onSaveEditCep(element: Loc_cep_PR) { this.update_cep.village
    console.log("::::Edit data::::", this.update_cep);
    this.indeRowEditCep = null;
    this.isRowEditCep = false;
    let update_cep: UpdateParcePr = {
      code_parce: element.code_parce,
      code_parce_temp: element.code_parce_temp,
      id_bloc: this.update_cep.bloc != null ? this.update_cep.bloc.code_bloc : null,
      id_benef: element.id_benef,
      ref_gps: this.update_cep.ref_gps,
      lat: this.update_cep.latitude,
      log: this.update_cep.longitude,
      superficie: this.update_cep.superficie,
      id_commune: this.update_cep.commune != null ? this.update_cep.commune.code_com : null,
      id_fkt: this.update_cep.fokontany != null ? this.update_cep.fokontany.code_fkt : null,
      village: this.update_cep.village,
      anne_adheran: null,
      dt_creation: moment().format('YYYY-MM-DD'),
      etat: element.etat === SYNC ? SYNC : UPDATE,
      status: ACTIVE
    }
    let data_update_cep = {
      isUpdateCep: true,
      data_cep: update_cep
    }
    console.log("Champ Ecole To Update:::", update_cep);
    this.crudService.UpdateParcellePr(data_update_cep).then(res => {
      console.log(res);
      this.loadPRBloc();
    });
  }
  onCancelEditCep() {
    this.indeRowEditCep = null;
    this.isRowEditCep = false;
    this.indeRowEdit = null;
  }

  // loadCollaborateur
  loadCollabo() {
    this.loadService.loadCollaborateurs().subscribe(data => {
      this.data_collaborateur = data;
    });
  }
  

  // load Parcelle
  loadPRBloc() {
    let data = {
      code_projet: this.projet.code_proj,
      id_tech: this.user[this.user.length - 1].id_equipe
    }
    // load Bloc Equipe
    this.loadService.loadBlocEquipe(data).then(res => {
      this.data_bloc = [];
      if (res.values.length > 0) {
        res.values.forEach(item => {
          this.data_bloc.push(item);
        });
      }
    });

    this.loadService.loadPRParceBloc(data).then(res => {
      this.data_parce = res.values;
    });
    this.loadService.loadPRBloc(data).then(res => {
      console.log("Response PR::", res.values);
      this.data_pr = res.values;

      if (this.data_pr.length > 0) {
        this.data_pr.forEach((item, i) => {
          if (this.data_parce.length > 0) {
            item.cep_pr = this.data_parce.filter(elem_parce => {return elem_parce.code_pr === item.code_pr});
          } else item.cep_pr = [];
        });
        this.loadExportPR(this.data_pr);
      }
      this.dataSourcePR.data = this.data_pr;
      console.log("PR::::", this.data_pr);
    });
  }

  // loadZone
  loadZone() {
    this.loadService.loadRegion().subscribe(res => {
      if (res.length > 0) {
        res.forEach(item => {
          this.data_region.push(item);
        });
      }
    });
    this.loadService.loadAllDistrict().then(res => {
      let dist: Loc_district[] = res.values;
      if (dist.length > 0) {
        dist.forEach(item => {
          this.data_district.push(item);
        });
      }
    });
    this.loadService.loadCommune({}).then(res => {
      let commune: Loc_Commune[] = res.values;
      if (commune.length > 0) {
        commune.forEach(item => {
          this.data_commune.push(item);
        });
      }
    });
    this.loadService.loadFokontany({}).then(res => {
      let fkt: Loc_Fokontany[] = res.values;
      if (fkt.length > 0) {
        fkt.forEach(elem => {
          this.data_fokontany.push(elem);
        });
      }
    });
  }

  async onPresentModal(data: any) {
    let data_: any;
    if (data.src === 'add') {
      data_ = {
        isBenefPr: true,
        isAdd: true,
        zone: {
          region: this.data_region,
          district: this.data_district,
          commune: this.data_commune,
          fokontany: this.data_fokontany
        }
      }
    } else if (data.src === 'edit') {
      data_ = { 
        isBenefPr: true,
        isEdit: true,
        zone: {
          region: this.data_region,
          district: this.data_district,
          commune: this.data_commune,
          fokontany: this.data_fokontany
        },
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
          this.isAddPr = true;
        } else if (data.src === 'edit') {
          this.isRowEdit = true;
        }
      }
    });
    await modal.present();
  }
  async onUpdatedCep(data: any) {
    //{src: 'add', data_pr: element, index_: i}
    let data_: any;
    if (data.src === 'add') {
      data_ = {
        isCepPr: true,
        isAddCep: true,
        zone: {
          region: this.data_region,
          district: this.data_district,
          commune: this.data_commune,
          fokontany: this.data_fokontany
        },
        bloc: this.data_bloc,
        elem_pr: data.data_pr
      }
    } else if (data.src === 'edit') {
      //{src: 'edit', data_pr: element, data_cep: row, index_cep: inde, index_pr: i}
      data_ = {
        isCepPr: true,
        isEditCep: true,
        zone: {
          region: this.data_region,
          district: this.data_district,
          commune: this.data_commune,
          fokontany: this.data_fokontany
        },
        bloc: this.data_bloc,
        elem_pr: data.data_pr,
        elem_cep: data.data_cep
      }
    }
    let modal = await this.modalCtrl.create({
      component: ModalPrPage,
      cssClass: 'modal-custum-pr',
      backdropDismiss: true,
      componentProps: data_
    });
    modal.onDidDismiss().then(modal_data => {
      console.log("::::Data Cep Dismissed:::", modal_data.data);
      if (modal_data.data != undefined) {
        this.update_cep = modal_data.data;
        if (data.src === 'add') {
          this.isAddCep = true;
          this.indeRowEdit = data.index_;
        } else if (data.src === 'edit') {
          this.indeRowEditCep = data.index_cep;
          this.indeRowEdit = data.index_pr;
          this.isRowEditCep = true;
        }
      }
    });
    await modal.present();
  }
  async onViewImage(elem_pr: Loc_PR) {
    let modal =  await this.modalCtrl.create({
      component: VisualiseurImagePage,
      cssClass: 'custom-view-img',
      backdropDismiss: true,
      componentProps: {
        isImgCinPR: true,
        elem_pr: elem_pr
      }
    });
    modal.onDidDismiss().then(modal_data => {
      if (modal_data != undefined) {
        elem_pr.img_cin
      }
    });
    await modal.present();
  }


  onRefresh() {
    console.log("::::Date now::::::", moment().format('YYYYMMDD') + '-' + moment().format('HHmmss'));
    console.log("::::Date now Time::::::", moment().format('YYYYMMDD-HHmmss'));
  }

  initUpdatedBenef() {
    this.update_benef = {
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
      contact: null,
      region: null,
      district: null,
      commune: null,
      fokontany: null,
      village: null,
      lieu_delivrance: null,
      code_achat: null,
      association: null,
      collaborateur: null,
      bloc: null
    }
  }

  onToggleTableRows() {
    this.isTablePRExpanded = !this.isTablePRExpanded;
    this.dataSourcePR.data.forEach(row => {
      if (row.cep_pr.length > 0) {
        row.isExpanded = this.isTablePRExpanded;
      } else {
        if (row.isExpanded) {
          row.isExpanded = false;
        }
      }
    });
  }

  onClick() {
    this.router.navigate(['homes']);
  }

}

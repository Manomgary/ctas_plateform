import { AfterViewInit, Component, OnInit } from '@angular/core';
//import { DatabaseService } from '../services/database.service';
import { Users } from '../utils/interface-benef';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { ModalPage } from '../pages/modal/modal.page';
import { LoadingController, ModalController } from '@ionic/angular';
import { Participe_proj_activ, Utilisateurs } from '../utils/interface-bd';
import { LoadDataService } from '../services/local/load-data.service';
import { ApiService } from '../services/api.service';
import { Loc_activ_projet, Loc_export_excel, Loc_projet } from '../interfaces/interfaces-local';
import { TempBenefInfo, TempPms, TempParcePms, TempContrat } from '../interfaces/interface-sync';
import { ExportExcelService } from '../services/export-excel.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  modalData: any;
  users: Utilisateurs[];
  Activite_Projet: Loc_activ_projet[] = [];
  projets: Loc_projet[] = [];
  nomPrjt: string = '';
  usersReady: boolean = false;
  isFirstConnection: boolean = false;
  selectedActive: Loc_activ_projet = {
    code: null,
    id_proj: null,
    nom: null,
    id_equipe: null,
    id_volet: null,
    id_activ: null,
    intitule: null,
    description: null,
    statuts: null
  };
  selectedProjet: Loc_projet = {
    numero: null,
    code_proj: null,
    nom: null,
    description: null,
    logo: null,
    statuts: null,
    ancronyme: null
  };

  data_export_benef_info: TempBenefInfo[] = [];
  data_export_pms: TempPms[] = [];
  data_export_parce_pms: TempParcePms[] = [];
  data_export_contrat_pms: TempContrat[] = [];
  data_export_mep_pms: any[] = [];
  data_export_suivi_pms: any[] = [];
 
  constructor(
              private route: Router,
              private loadData: LoadDataService,
              private modalCtrl: ModalController,
              private api: ApiService,
              private loadingCtrl: LoadingController,
              private dataExport: ExportExcelService)
              {
                console.log("<========Constructeur Homme Page=================>");
                if (this.route.getCurrentNavigation().extras.state) {
                  const routeState = this.route.getCurrentNavigation().extras.state;
                  if (routeState)
                  {
                    console.log("*******************");
                    this.users = JSON.parse(routeState.users);
                    this.isFirstConnection = routeState.isFirstConnect;
                    console.log(this.users);
                  }
                }
              }
  ngOnInit() {
    console.log("<=======NgOnInit Homme Page=================>");
    this.loadProjet();
    /**this.loadAllBeneficiaire();
    this.loadAllMEP();*/
  }

  async presentModal(data) {
    const modal = await this.modalCtrl.create({
      component: ModalPage,
      cssClass: 'my-custom-modal-suivi',
      //backdropDismiss: false,
      componentProps: {
        'isHome': true,
        'selectedActivite': data
      }
    });
    modal.onDidDismiss().then(async (data_dism) => {
        console.log(data_dism);
        if (data_dism.data != undefined) {
          console.log("*****Modal Data*****");
          this.modalData = data_dism;
          const navigationExtras: NavigationExtras = {
            state : {
              zone: JSON.stringify(this.modalData),
              projet: JSON.stringify(this.selectedProjet),
              activite: this.selectedActive, // intituler de l'activité
              users: this.users
            }
          };
          console.log(navigationExtras);
          this.route.navigate(['menu'], navigationExtras);          
        }
    });
    await modal.present();
  }
  doMenu(data: Loc_activ_projet) {
    this.selectedActive = data;
    if (this.selectedActive.intitule == "PR") {
      const navigationExtras: NavigationExtras = {
        state : {
          projet: JSON.stringify(this.selectedProjet),
          activite: this.selectedActive, // intituler de l'activité
          users: this.users
        }
      };
      this.route.navigate(['menu'], navigationExtras);
    } else if(this.selectedActive.intitule == "BI") {
      // A refaire
    } else {
      this.presentModal(this.selectedActive);
    }
  }

  loadProjet() {
    this.loadData.loadAllProjet({}).subscribe(res => {
      this.projets = res;
      console.log("***get Projet home page***");
      console.log(this.projets);
      if (this.projets.length > 0) {
        this.selectedProjet = this.projets[0];
        if (!(Object.keys(this.selectedProjet).length === 0)) {
          let data_ = {
            id_projet: this.selectedProjet.code_proj,
            code_equipe: this.users[this.users.length - 1].id_equipe
          }
          this.loadActivitePr(data_);
        }
      }
    });
  }

  /**projetChange(value) {
    console.log("==== ngModel change ====");
    console.log(value);
    console.log(this.selectedProjet);
    let data_ = {
      id_projet: this.selectedProjet.code_proj,
      code_equipe: this.users[this.users.length - 1].id_equipe
    }
    this.loadActivitePr(data_);
  }*/
  onSelectProjet() {
    console.log(":::Selected projet::::", this.selectedProjet);
    let data_ = {
      id_projet: this.selectedProjet.code_proj,
      code_equipe: this.users[this.users.length - 1].id_equipe
    }
    this.loadActivitePr(data_);
  }

  loadActivitePr(id_projet) {
    this.loadData.loadActiveProjet(id_projet).subscribe(data => {
      console.log("-------Homme Page ACTIVITE-------" );
      console.log(data);
      this.Activite_Projet = [];
      this.Activite_Projet = data;
      console.log(this.Activite_Projet);
      this.Activite_Projet.forEach((elem) => {
        this.nomPrjt = elem.nom;
      });
    });
  }

  goToRoot() {
    const navigationExtras: NavigationExtras = {
      state : {
        projet: JSON.stringify(this.selectedProjet),
        users: JSON.stringify(this.users)
      }
    };
    console.log("Sync Homme Page =====>");
    console.log(navigationExtras.state)
    this.route.navigate(['synchro/'], navigationExtras);
  }
  onExport() {
    let export_pms: Loc_export_excel[] = [
      {
        data: this.data_export_benef_info,
        name_feuille: 'beneficiaire',
        name_file: 'BDD_PMS_'
      },
      {
        data: this.data_export_pms,
        name_feuille: 'benef_activ_pms',
        name_file: 'BDD_PMS_'
      },
      {
        data: this.data_export_parce_pms,
        name_feuille: 'assoc_parce',
        name_file: 'BDD_PMS_'
      },
      {
        data: this.data_export_contrat_pms,
        name_feuille: 'assoc_parce_saison',
        name_file: 'BDD_PMS_'
      }
    ]
    this.dataExport.onExport(export_pms);
  }
  onExportSuivi() {
    let export_pms: Loc_export_excel[] = [
      {
        data: this.data_export_mep_pms,
        name_feuille: 'cultures_pms',
        name_file: 'BDD_PMS_MEP'
      },
      {
        data: this.data_export_suivi_pms,
        name_feuille: 'suivi_pms',
        name_file: 'BDD_PMS_MEP'
      }
    ]
    this.dataExport.onExport(export_pms);
  }
  loadAllBeneficiaire(){
    /**this.loadData.exportAllBenefInfo().then(res => {
      this.data_export_benef_info = res.values;
    });*/
    this.loadData.exportAllPms().then(res => {
      this.data_export_pms = res.values;
    });
    this.loadData.exportAllAssocParce().then(res => {
      this.data_export_parce_pms = res.values;
    });
    this.loadData.exportAllContrat().then(res => {
      this.data_export_contrat_pms = res.values;
    });
  }
  loadAllPms(){
    this.data_export_benef_info = [];
    this.data_export_pms = [];
    this.data_export_parce_pms = [];
    this.data_export_contrat_pms = [];

    this.loadData.exportAllAssociation().then(res_ass => {
      res_ass.values.forEach((elem_assoc, ind_assoc) => {
        this.loadData.exportAllBenefInfo({code_ass: elem_assoc.code_ass}).then(res => {
          res.values.forEach(elem_info => {
            elem_info.img_benef = null;
            elem_info.img_cin = null;
            this.data_export_benef_info.push(elem_info);
          });
        });
      });
    });
    this.loadData.exportAllPms().then(res => {
      this.data_export_pms = res.values;
    });
    this.loadData.exportAllAssocParce().then(res => {
      this.data_export_parce_pms = res.values;
    });
    this.loadData.exportAllContrat().then(res => {
      this.data_export_contrat_pms = res.values;
    });
  }
  loadAllMEP() {
    this.loadData.exportAllMEP().then(res_mep => {
      this.data_export_mep_pms = res_mep.values;
    });
    this.loadData.exportAllsuivi().then(res_mep => {
      this.data_export_suivi_pms = res_mep.values;
    });
  }
}

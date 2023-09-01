import { Component, Input, OnInit } from '@angular/core';
import { ThemePalette } from '@angular/material/core';
import { LoadingController, ModalController, NavParams } from '@ionic/angular';
import { Benef_activ_pms, controle_culte, declaration_culte, Local_Parcelle, Loc_activ_projet, Loc_all_contrat_pms, Loc_all_suivi_mep, Loc_AnneeAgricole, Loc_association, Loc_Commune, Loc_culture_Pms, Loc_Espece, Loc_saison, Loc_variette, stc_ec_culte } from 'src/app/interfaces/interfaces-local';
import { ApiService } from 'src/app/services/api.service';
import { ImportDataService } from 'src/app/services/import-data.service';
import { Projet } from 'src/app/utils/interface-bd';
import { LoadDataService } from '../../services/local/load-data.service';

import * as _moment from 'moment';
import { Moment } from 'moment';
import { CONTROLE_MEP, DECLARATION_MEP, EC_CULTURAL, SC, STC } from 'src/app/utils/global-variables';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CaptureImageService } from 'src/app/services/capture-image.service';

const moment = _moment;
//import 'moment/locale/ja';
//import 'moment/locale/fr';

export interface Task {
  nom: string;
  completed: boolean;
  color: ThemePalette;
  subtasks?: any[];
}
interface LocalFile {
  name: string;
  date: string;
  data: string;
}

@Component({
  selector: 'app-modal',
  templateUrl: './modal.page.html',
  styleUrls: ['./modal.page.scss'],
})
export class ModalPage implements OnInit {
  // Data passed in by componentProps
  isHome: boolean = false;
  isLogin: boolean = false;
  isSuiviRp: boolean = false;
  zoneForm: FormGroup;
  mep_form: FormGroup;
  suiviForm: FormGroup;

  data_region: any[] = [];
  data_district: any[] = [];
  data_commune: Loc_Commune[] = [];
  //suivi Rp
  data_saison: Loc_saison[] = [];
  annee_du: any[] = ['2021', '2022'];
  data_association: Loc_association[] = [];
  data_pms: Benef_activ_pms[] =  [];
  data_pms_filtre: Benef_activ_pms[] =  [];
  data_parcelle: Local_Parcelle[] = [];
  data_parcelle_Filtre: Local_Parcelle[] = [];
  data_espece: Loc_Espece[] = [];
  data_variette: Loc_variette[] = [];
  data_variette_filter: Loc_variette[] = [];
  data_variette_filter_ea: Loc_variette[] = [];
  data_sc: any[] = SC;
  //data_ea: any[] = ['Niébé'];

  data_users: any[] = [];
  checkedProject: any[] = [];

  //suiviRp
  isCulteAssocie: boolean = false;
  isCulteBande: boolean = false;
  isSelectedVarEa: boolean = false;
  isSelectedOtherCulte: boolean = false;
  // Suivi MEP
  isSuiviMepRp: boolean = false;
  isAddSuiviMep: boolean = false;
  isEditSuiviMep: boolean = false;
  elem_mep: Loc_culture_Pms;
  elem_edit_suivi_mep: Loc_all_suivi_mep;
  data_stc: stc_ec_culte[] = STC;
  data_ec: stc_ec_culte[] = EC_CULTURAL;
  data_controle_culte: controle_culte[] = CONTROLE_MEP;
  data_declaration_culte: declaration_culte[] = DECLARATION_MEP;

  task: Task = {
    nom: 'selectionner tout',
    completed: false,
    color: 'primary',
    subtasks: [],
  };

  allComplete: boolean = false;
  Activite_Projet: any[];
  selectedActivite: Loc_activ_projet;
  isBloc: boolean = false;
  data_suivi_edit: Loc_culture_Pms;

  data_annee_agricole: Loc_AnneeAgricole[] = [];
  data_all_contrat_pms: Loc_all_contrat_pms[] = [];
  data_contrat_pms_filter: Loc_all_contrat_pms[] = [];

  unite_espece: string = null;
  unite_estimation: string = null;
  unite_objectif: string = null;

  fileImage: LocalFile = {
    name: null,
    date: null,
    data: null
  }
  
  constructor(
              private modalCtrl: ModalController,
              private navParams: NavParams,
              private loadData: LoadDataService,
              private loadingCtrl: LoadingController,
              private api: ApiService,
              private importService: ImportDataService,
              private formBuilder: FormBuilder,
              private captureImg: CaptureImageService) {
                this.loadInitiale();
              }

  ngOnInit() {
    if (this.isSuiviRp) {
      this.loadFormMep();
    }
    if (this.isSuiviMepRp) {
      this.loadFormSuiviMep();
    }
    if (this.isHome) {
      this.loadFormZone();
    }
  }

  async loadInitiale() {
    if(this.navParams.get('isLogin')) {
      let data: any;
      this.isLogin = this.navParams.get('isLogin');
      data = this.navParams.get('users');
      console.log(data);
      this.data_users = JSON.parse(data);
      console.log(this.data_users);
      this.data_users.forEach((element, i) => {
        console.log(element);  
        let id_pr = {
          id_projet: element.id_proj
        }
        if (i == (this.data_users.length - 1)) {
          this.loadProjet();
        }
      });
      
    } else if (this.navParams.get('isHome') || this.navParams.get('isModificationZone')) {
      if (this.navParams.get('isHome')) {
        this.isHome = this.navParams.get('isHome');
        this.selectedActivite = this.navParams.get('selectedActivite');
      } else {
        this.isHome = this.navParams.get('isModificationZone');
        this.selectedActivite = this.navParams.get('activite');
      }
      console.log("selected activiter ===> ", this.selectedActivite);

      if (this.selectedActivite.intitule.toUpperCase() === 'BLOC') {
        this.isBloc = true;
      }

      this.loadData.loadRegion().subscribe((res) => {
        console.log("*** MODAL CONTROLLER REGION ****");
        console.log(res);
        this.data_region = res;
        console.log(this.data_region);
      });
    } else if (this.navParams.get('isSuiviRp')) {
      let espece: Loc_Espece[] = [];
      this.isSuiviRp = this.navParams.get('isSuiviRp');
      this.data_association = this.navParams.get('association');
      this.data_pms = this.navParams.get('pms');
      this.data_saison = this.navParams.get('saison');
      this.data_all_contrat_pms = this.navParams.get('contrat');
      this.data_parcelle = this.navParams.get('parcelle');
      this.data_annee_agricole = this.navParams.get('annee_agricole');

      espece = this.navParams.get('espece');
      this.data_espece = espece.filter(item => {return item.id_categ === 1}); // semences en graine
      this.data_variette = this.navParams.get('variette');
      this.data_suivi_edit = this.navParams.get('data_edit') != undefined? this.navParams.get('data_edit'): undefined;

    } else if (this.navParams.get('isSuiviMepRp')) {
      this.isSuiviMepRp = this.navParams.get('isSuiviMepRp');
      this.elem_mep = this.navParams.get('element_mep');
      this.data_espece = this.navParams.get('espece'); // semences en graine
      this.data_variette = this.navParams.get('variette');
      this.data_variette.forEach(elem_var => {
        if (elem_var.code_var === this.elem_mep.id_var) {
          let filter_espece = this.data_espece.filter(item_espece => {return item_espece.code_espece === elem_var.id_espece});
          this.unite_estimation = filter_espece[0].unite_estimation;
        }
      });

      if (this.navParams.get('isAddSuiviMep')) {
        this.isAddSuiviMep = this.navParams.get('isAddSuiviMep');
      }
      if (this.navParams.get('isEditSuiviMep')) {
        this.isEditSuiviMep = this.navParams.get('isEditSuiviMep');
        this.elem_edit_suivi_mep = this.navParams.get('element_suivi');
      }
    }
  }

  loadFormMep() {
    if (this.data_suivi_edit != undefined) {
      let annee_: Loc_AnneeAgricole = null;
      let assoc_: Loc_association = null;
      let saison_: Loc_saison = null;
      let benef_pms: Benef_activ_pms = null;
      let contrat_: Loc_all_contrat_pms = null;
      let parce_: Local_Parcelle = null;
      let sc_: any = null;
      let espece_: Loc_Espece = null;
      let variette_: Loc_variette = null;
      let espece_ea: Loc_Espece = null;
      let variette_ea: Loc_variette = null;
      let autreCultureEa: string = null;

      let benef_pms_filtre: Benef_activ_pms[] = [];

      this.data_annee_agricole.forEach(item_annee => {
        if (item_annee.code === this.data_suivi_edit.id_annee) {
          annee_ = item_annee;
        }
      });
      this.data_saison.forEach(item => {
        if (item.code_saison === this.data_suivi_edit.id_saison) {
          saison_ = item;
        }
      });
      this.data_association.forEach(item => {
        if (item.code_ass === this.data_suivi_edit.code_ass) {
          console.log(item);
          assoc_ = item;
        }
      });

      // filtre pms
      benef_pms_filtre = this.data_pms.filter(item_pms => {return item_pms.id_saison === saison_.code_saison && item_pms.id_annee === annee_.code && item_pms.id_association === assoc_.code_ass});
      if (benef_pms_filtre.length > 0) {
        benef_pms_filtre.forEach(elem_pms_filtre => {
          let verif_pms = this.data_pms_filtre.filter(item_pms => {return item_pms.code_benef_pms === elem_pms_filtre.code_benef_pms});
          if (verif_pms.length === 0) {
            this.data_pms_filtre.push(elem_pms_filtre);
          }
        });
      }
      this.data_pms_filtre.forEach(item => {
        if (item.code_benef_pms === this.data_suivi_edit.code_benef_pms) {
          console.log("item data_pms selected ", item);
          benef_pms = item;
        }
      });
      // parce filter
      /**this.data_parcelle.forEach(item => {
        if (item.code_parce === this.data_suivi_edit.id_parce) {
          console.log("item data_parcelle ::: ", item);
          parce_temp = item;
        }
      });*/

      this.data_contrat_pms_filter = this.data_all_contrat_pms.filter(item_contrat => {return item_contrat.id_annee === annee_.code && item_contrat.id_saison === saison_.code_saison && item_contrat.id_pms === benef_pms.code_benef_pms && item_contrat.code_ass === assoc_.code_ass});
      this.data_contrat_pms_filter.forEach(elem_contrat => {
        if (elem_contrat.code === this.data_suivi_edit.id_contrat) {
          contrat_ = elem_contrat;
          // parcelle
          this.data_parcelle_Filtre = this.data_parcelle.filter(item => {return item.code_contrat === elem_contrat.code && item.id_saison === saison_.code_saison && item.id_annee === annee_.code && item.code_benef_pms === benef_pms.code_benef_pms});
          this.data_parcelle_Filtre.forEach(item => {
            if (item.code_parce === this.data_suivi_edit.id_parce) {
              console.log("item data_parcelle ::: ", item);
              parce_ = item;
            }
          });
        }
      });

      /************************
       * Variette
       ************************/
      this.data_espece.forEach(item => {
        if (item.code_espece === this.data_suivi_edit.code_espece) {
          espece_ = item;
          this.unite_espece = espece_.unite;
        }
      });
      this.data_variette_filter = this.data_variette.filter(elem => {return elem.id_espece === espece_.code_espece});
      this.data_variette_filter.forEach(elem => {
        if (elem.code_var === this.data_suivi_edit.id_var) {
          variette_ = elem;
        }
      });
      /******************************
       * Système Culturale
       ******************************/
      this.data_sc.forEach(item => {
        if (item.value === this.data_suivi_edit.sc) {
          sc_ = item;
               //
          if (sc_.value === "C.associé") {
            this.isSelectedOtherCulte = false;
            this.isCulteBande = false;
            this.isCulteAssocie = true;
          } else if (sc_.value === "C.bande") {
            this.isSelectedOtherCulte = false;
            this.isCulteBande = true;
            this.isCulteAssocie = false;
          } else {
            this.isSelectedOtherCulte = false;
            this.isCulteBande = false;
            this.isCulteAssocie = false;
          }
        }
      });

      //
      if (this.data_suivi_edit.ea_id_variette !== null) {
        this.data_espece.forEach(item => {
          if (item.code_espece === this.data_suivi_edit.ea_id_espece) {
            espece_ea = item;
          }
        });
        this.data_variette_filter_ea = this.data_variette.filter(elem => {return elem.id_espece === espece_ea.code_espece});
        this.data_variette_filter_ea.forEach(item => {
          if (item.code_var === this.data_suivi_edit.ea_id_variette) {
            variette_ea = item;
          }
        });
      } else if (this.data_suivi_edit.ea_autres !== null) {
        this.isSelectedOtherCulte = true;
        autreCultureEa = this.data_suivi_edit.ea_autres;
      }

      this.mep_form = this.formBuilder.group({
        annee: [annee_, Validators.required],
        saison: [saison_, Validators.required],
        association: [assoc_, Validators.required],
        pms: [benef_pms, Validators.required],
        contrat: [contrat_, Validators.required],
        parcelle: [parce_, Validators.required],
        ddp: [this.data_suivi_edit.ddp != null?moment(this.data_suivi_edit.ddp, "YYYY-MM-DD"):null, Validators.required],
        espece: [espece_, Validators.required],
        variette: [variette_, Validators.required],
        qsa: this.data_suivi_edit.qsa,
        dds: [this.data_suivi_edit.dds != null?moment(this.data_suivi_edit.dds, "YYYY-MM-DD"):null, Validators.required],
        sfce: !this.isCulteBande?[this.data_suivi_edit.sfce, Validators.required]:this.data_suivi_edit.sfce,
        sc: [sc_, Validators.required],
        espece_associe: espece_ea,
        variette_associe: variette_ea,
        autreEa: autreCultureEa,
        nb_ligne: this.isCulteBande?[this.data_suivi_edit.nb_ligne, Validators.required]:this.data_suivi_edit.nb_ligne,
        long_ligne: this.data_suivi_edit.long_ligne
      });
    } else {
      this.mep_form = this.formBuilder.group({
        annee: [null, Validators.required],
        saison: [null, Validators.required],
        association: [null, Validators.required],
        pms: [null, Validators.required],
        contrat: [null, Validators.required],
        parcelle: [null, Validators.required],
        ddp: [null, Validators.required],
        espece: [null, Validators.required],
        variette: [null, Validators.required],
        qsa: null,
        dds: [null, Validators.required],
        sfce: [null, Validators.required],
        sc: [null, Validators.required],
        espece_associe: null,
        variette_associe: null,
        autreEa: null,
        nb_ligne: [null, Validators.required],
        long_ligne: null
      });
    }
  }

  loadFormSuiviMep() {
    if (this.isAddSuiviMep) {
      this.suiviForm = this.formBuilder.group({
        ddp: [null, Validators.required],
        stc: [null, Validators.required],
        ec: [null, Validators.required],
        pb: [null, Validators.maxLength(20)],
        ex: null,
        img_culte: null,
        controle: null,
        declaration: null
      });
    } else if (this.isEditSuiviMep) {
      let stc_: stc_ec_culte = null;
      let ec_: stc_ec_culte = null;
      let controle_: controle_culte;
      let declaration_: declaration_culte;

      this.data_stc.forEach(elem_stc => {
        if (elem_stc.value === this.elem_edit_suivi_mep.stc) {
          stc_ = elem_stc;
        }
      });
      this.data_ec.forEach(elem_ec => {
        if (elem_ec.value === this.elem_edit_suivi_mep.ec) {
          ec_ = elem_ec;
        }
      });
      this.data_controle_culte.forEach(elem_ctrl => {
        if (elem_ctrl.value === this.elem_edit_suivi_mep.controle) {
          controle_ = elem_ctrl;
        }
      });
      this.data_declaration_culte.forEach(elem_dec => {
        if (elem_dec.value === this.elem_edit_suivi_mep.declaration) {
          declaration_ = elem_dec;
        }
      });
      //image
      if (this.elem_edit_suivi_mep.img_cult != null) {
        this.fileImage.data = this.elem_edit_suivi_mep.img_cult;
      }


      this.suiviForm = this.formBuilder.group({
        ddp: [this.elem_edit_suivi_mep.ddp != null?moment(this.elem_edit_suivi_mep.ddp, "YYYY-MM-DD"):null, Validators.required],
        stc: [stc_, Validators.required],
        ec: [ec_, Validators.required],
        pb: this.elem_edit_suivi_mep.pb,
        ex: this.elem_edit_suivi_mep.ex,
        img_culte: this.fileImage.data,
        controle: controle_,
        declaration: declaration_
      });
    }
  }

  loadFormZone() {
    this.zoneForm = this.formBuilder.group({
      region: [null, Validators.required],
      district: [null, Validators.required],
      commune: !this.isBloc?[null, Validators.required]:null
    });
  }

  async loadProjet() {
    let data_projet: Projet[];
    const loading = await this.loadingCtrl.create();
    await loading.present();

    this.api.getProjet().subscribe((res: Projet[]) => {  
      data_projet = res;
      console.log(data_projet);
      data_projet.forEach((elem, i) => {
        console.log(elem);
        this.task.subtasks.push({
          code_projet: elem.code_proj,
          nom: elem.nom, 
          completed: false, 
          color: 'primary'
        });
        if (i == (data_projet.length - 1)) {
          console.log("==Fin du boucle projet==");
          loading.dismiss();
        }
      });
    });
  }

  // close modal
  onValideZone() {
    let zone = this.zoneForm.value
    const zone_dest = {
      region: zone.region,
      district: zone.district,
      commune: zone.commune,
      valide: true,
      dismissed: false
    }
    console.log(zone_dest);
    this.modalCtrl.dismiss(zone_dest);
    this.isHome = false;
    this.isBloc = false;
  }
  revenirModal() {
    this.modalCtrl.dismiss();
  }

  async importData() {
    const loading = await this.loadingCtrl.create();
    await loading.present();
    console.log(this.task);
    this.task.subtasks.forEach((item, i) => {
      console.log(item);
      if(item.completed) {
        this.checkedProject.push({
          code_projet: item.code_projet
        });
      }
      if (i == (this.task.subtasks.length - 1)) {
        console.log(this.checkedProject);
        this.checkedProject.forEach((elem, i) => {
          console.log("************* Project loaded ********");
          console.log(elem);
          let id_pr = {
            id_projet: elem.code_projet
          }
          this.importService.loadProjet(id_pr);

        });
        setTimeout(() => {
          this.modalCtrl.dismiss();
          this.isLogin = false;
          loading.dismiss();
        }, 11000);
      }
    });
  }

  // Suivi Rp
  addCulture() {
    const mep_culture = this.mep_form.value;
    //this.data_contrat_pms_filter[0].code
    if (mep_culture.contrat != null && mep_culture.contrat != undefined) {
      if (this.data_suivi_edit != undefined) {
        this.modalCtrl.dismiss(mep_culture);
      } else {
        this.loadData.findMEPContrat(mep_culture.contrat.code).then(res => {
          if (res.values.length > 0)  {
            alert("Mise en Place déjà identifier, Veuillez choisir un autre contrat ou cliquer sur le bouton Annuler !!!");
          } else {
            this.modalCtrl.dismiss(mep_culture);
          }
        });
      }
    }
  }

  onSaveSuivi() {
    const suivi_mep = this.suiviForm.value;
    this.modalCtrl.dismiss(suivi_mep);
  }

  onRegion() {
    let code_region: string = null;
    if (this.zoneForm.value.region != null) {
      code_region = this.zoneForm.value.region.code_reg
    }
    this.zoneForm.patchValue({
      district: null,
      commune: null
    });
    this.loadData.loadDistrict(code_region).subscribe(res => {
      console.log(res);
      this.data_district = res;
    }, error => {
      console.log("Modal error Request response ==> " + error);
    });

  }

  onDistrict() {
    this.data_commune = [];
    if (!this.isBloc) {
      let code_dist: string = null;
      this.zoneForm.patchValue({
        commune: null
      });
      if (this.zoneForm.value.district != null) {
        code_dist = this.zoneForm.value.district.code_dist
      }
      let id_dist = {
        code_dist: code_dist
      };
      this.loadData.loadCommune(id_dist).then(res => {
        console.log(res);
        res.values.forEach(elem_com => {
          this.data_commune.push(elem_com);
        });
      },
      error => {
        console.log("Modal error Request response ==> " + error);
      });
    }
  }

  onCommune() {}

  // suivi PMS
  onSelectAssoc() {
    let selected_association: Loc_association = this.mep_form.value.association;
    let selected_saison: Loc_saison = this.mep_form.value.saison;
    let selected_annee: Loc_AnneeAgricole = this.mep_form.value.annee;
    let benef_pms_filtre: Benef_activ_pms[] = [];

    this.data_pms_filtre = [];
    this.data_parcelle_Filtre = [];
    this.data_contrat_pms_filter = [];
    this.data_variette_filter = [];

    this.mep_form.patchValue({
      pms: null,
      contrat: null,
      parcelle: null,
      espece: null,
      variette: null
    });

    benef_pms_filtre = this.data_pms.filter(item_pms => {return item_pms.id_annee === selected_annee.code && item_pms.id_saison === selected_saison.code_saison && item_pms.id_association === selected_association.code_ass});
    if (benef_pms_filtre.length > 0) {
      benef_pms_filtre.forEach(elem_pms_filtre => {
        let verif_pms = this.data_pms_filtre.filter(item_pms => {return item_pms.code_benef_pms === elem_pms_filtre.code_benef_pms});
        if (verif_pms.length === 0) {
          this.data_pms_filtre.push(elem_pms_filtre);
        }
      });
    }
  }

  onSelectPms() {
    let selected_pms: Benef_activ_pms = this.mep_form.value.pms;
    let selected_saison: Loc_saison = this.mep_form.value.saison;
    let selected_annee: Loc_AnneeAgricole = this.mep_form.value.annee;

    this.data_parcelle_Filtre = [];
    this.data_contrat_pms_filter = [];
    this.data_variette_filter = [];

    this.mep_form.patchValue({
      contrat: null,
      parcelle: null,
      espece: null,
      variette: null
    });
    this.data_contrat_pms_filter = this.data_all_contrat_pms.filter(item_contrat => {return item_contrat.id_pms === selected_pms.code_benef_pms && item_contrat.id_annee === selected_annee.code && item_contrat.id_saison === selected_saison.code_saison});
  }

  onSelectContrat() {
    let selected_contrat: Loc_all_contrat_pms = this.mep_form.value.contrat;
    let selected_saison: Loc_saison = this.mep_form.value.saison;
    let selected_annee: Loc_AnneeAgricole = this.mep_form.value.annee;
    let selected_pms: Benef_activ_pms = this.mep_form.value.pms;

    let selected_parcelle: Local_Parcelle = null;
    let selected_espece: Loc_Espece = null;
    let selected_variette: Loc_variette = null;

    this.data_parcelle_Filtre = [];

    this.data_parcelle_Filtre = this.data_parcelle.filter(item => {return item.code_contrat === selected_contrat.code && item.id_saison === selected_saison.code_saison && item.id_annee === selected_annee.code && item.code_benef_pms === selected_pms.code_benef_pms});
    this.data_parcelle_Filtre.forEach(elem_parce => {
      if (elem_parce.code_parce === selected_contrat.id_parce) {
        selected_parcelle = elem_parce;
      }
    });
    this.data_variette.forEach(elem_var => {
      //
      if (elem_var.code_var === selected_contrat.id_var) {
        selected_variette = elem_var;
        //
        this.data_espece.forEach(elem_espece => {
          if (elem_espece.code_espece === selected_variette.id_espece) {
            selected_espece = elem_espece;
            this.unite_espece = selected_espece.unite;
          }
        });
      }
    });
    if (selected_espece != null) {
      this.data_variette_filter = this.data_variette.filter(item_var => {return item_var.id_espece === selected_espece.code_espece});
    }

    this.mep_form.patchValue({
      parcelle: selected_parcelle,
      espece: selected_espece,
      variette: selected_variette
    });
    console.log("::::data_parcelle_Filtre::::", this.data_parcelle_Filtre);
    // patch value variette
  }

  onSelectEspece() {
    let selected_espece: Loc_Espece = this.mep_form.value.espece;
    this.mep_form.patchValue({
      variette: null
    });
    this.unite_espece = selected_espece.unite;
    //this.unite_estimation = selected_espece.unite_estimation;
    this.data_variette_filter = this.data_variette.filter(elem_var => {return elem_var.id_espece === selected_espece.code_espece});
  }

  onSeletSc() {
    let selected_sc: any = this.mep_form.value.sc;
    
    if (selected_sc.value === "C.associé") {
      this.data_variette_filter_ea = [];
      this.mep_form.patchValue({
        espece_associe: null,
        variette_associe: null,
        autreEa: null,
        nb_ligne: null,
        long_ligne: null
      });
      this.isSelectedOtherCulte = false;
      this.isCulteBande = false;
      this.isCulteAssocie = true;
      this.addValidators(['sfce']);
      this.removeValidators(['nb_ligne']);
    } else if (selected_sc.value === 'C.bande') {
      this.mep_form.patchValue({
        espece_associe: null,
        variette_associe: null,
        autreEa: null,
        nb_ligne: null,
        long_ligne: null
      });
      this.isCulteBande = true;
      this.isSelectedOtherCulte = false;
      this.isCulteAssocie = false;
      this.removeValidators(['sfce']);
      this.addValidators(['nb_ligne']);
    }
    else {
      // Culture en bande ou pure
      this.mep_form.patchValue({
        espece_associe: null,
        variette_associe: null,
        autreEa: null,
        nb_ligne: null,
        long_ligne: null
      });
      this.isSelectedOtherCulte = false;
      this.isCulteAssocie = false;
      this.isCulteBande = false;
      this.addValidators(['sfce']);
      this.removeValidators(['nb_ligne']);
    }
  }
  onSelectEspeceAutre(data: any) {
    if (data === 'autre') {
      this.isSelectedOtherCulte = true;
      this.data_variette_filter_ea = [];
      this.mep_form.patchValue({
        espece_associe: null,
        variette_associe: null,
        autreEa: null
      });
    } else if (data === 'espece') {
      let selected_espece_ea: Loc_Espece = this.mep_form.value.espece_associe;
      this.mep_form.patchValue({
        autreEa: null
      });
      this.isSelectedOtherCulte = false;
      this.data_variette_filter_ea = this.data_variette.filter(elem => {return elem.id_espece === selected_espece_ea.code_espece});
    }
  }
  // on select annee agricole 
  onSelectAnneeAgricole() {
    //this.selected_annee
    this.data_pms_filtre = [];
    this.data_parcelle_Filtre = [];
    this.data_contrat_pms_filter = [];
    this.data_variette_filter = [];
    this.mep_form.patchValue({
      association: null,
      pms: null,
      contrat: null,
      parcelle: null,
      espece: null,
      variette: null
    });
  }
  //onSelectSaison()
  onSelectSaison() {
    //this.selected_saison
    this.data_pms_filtre = [];
    this.data_parcelle_Filtre = [];
    this.data_contrat_pms_filter = [];
    this.data_variette_filter = [];

    this.mep_form.patchValue({
      association: null,
      pms: null,
      contrat: null,
      parcelle: null,
      espece: null,
      variette: null
    });
  }
  onNone(src: string) {
    if (src === 'declaration') {
      if (this.isSuiviMepRp) {
        this.suiviForm.patchValue({
          declaration: null
        });
      }
    } else if(src === 'controle') {

      if (this.isSuiviMepRp) {
        this.suiviForm.patchValue({
          controle: null
        });
      }

    }
  }

  /**
   * ANGULAR CHECKBOX
   */
   updateAllComplete() {
    this.allComplete = this.task.subtasks != null && this.task.subtasks.every(t => t.completed);
  }

  // Image
  async takeImage() {
    this.captureImg.getImage().then(res => {
      console.log(":::Res Image:::", res);
        this.fileImage = res;
        if (this.isSuiviMepRp) {
          this.suiviForm.patchValue({
            img_culte: this.fileImage.data
          });
        }
    });
  }
  onDeleteImage() {
    this.fileImage = {
      name: null,
      date: null,
      data: null
    }
    if (this.isSuiviMepRp) {
      this.suiviForm.patchValue({
        img_culte: null
      });
    }
  }

  someComplete(): boolean {
    if (this.task.subtasks == null) {
      return false;
    }
    return this.task.subtasks.filter(t => t.completed).length > 0 && !this.allComplete;
  }

  setAll(completed: boolean) {
    this.allComplete = completed;
    if (this.task.subtasks == null) {
      return;
    }
    this.task.subtasks.forEach(t => (t.completed = completed));
  }
  addValidators(controls : string[]){
    if (this.isSuiviRp) {
      controls.forEach(c => {
        this.mep_form.get(c).setValidators(Validators.required);
        this.mep_form.get(c).updateValueAndValidity();
      });
    } 
  }

  removeValidators(controls : string[]){
    if (this.isSuiviRp) {
      controls.forEach(c => {
        this.mep_form.get(c).clearValidators();
        this.mep_form.get(c).updateValueAndValidity();
      });
    } 
  }

}

import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Benef_activ_pms, Local_benef_activ_bl, Local_bloc_parce, Loc_all_suivi_bloc, Loc_all_suivi_mep, Loc_AnimationVe, Loc_cep_PR, Loc_culture_Pms, Loc_MepPR, Loc_mep_bloc, Loc_Parce_saison, Loc_PR, Loc_Suivi_MepPR } from 'src/app/interfaces/interfaces-local';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss'],
})
export class DialogComponent implements OnInit {
  isMepRP: boolean = false;
  isSuiviRP: boolean = false;
  isDeletePms: boolean = false;
  isDeleteContrat: boolean = false;
  isDeleteSuiviBloc: boolean = false;
  isDeleteMepBloc: boolean = false;
  isDeleteBenefBloc: boolean = false;
  isDeleteParceBloc: boolean = false;
  isDeleteSuiviPr: boolean = false;
  isDeleteMepPR: boolean = false;
  isDeleteAnimeVePR: boolean = false;
  isDeleteCepPR: boolean = false;
  isDeletePR: boolean = false;

  element_mep: Loc_culture_Pms = <Loc_culture_Pms>{};
  element_suivi: Loc_all_suivi_mep = <Loc_all_suivi_mep>{};
  element_pms: Benef_activ_pms = <Benef_activ_pms>{};
  element_contrat: Loc_Parce_saison = <Loc_Parce_saison>{};
  elem_suivi_bloc: Loc_all_suivi_bloc = <Loc_all_suivi_bloc>{};
  elem_mep_bloc: Loc_mep_bloc = <Loc_mep_bloc>{};
  elem_benef_bloc: Local_benef_activ_bl = <Local_benef_activ_bl>{};
  elem_parce_bloc: Local_bloc_parce = <Local_bloc_parce>{};
  elem_suivi_pr: Loc_Suivi_MepPR = <Loc_Suivi_MepPR>{};
  elem_mep_pr: Loc_MepPR = <Loc_MepPR>{};
  elem_animeVe_pr: Loc_AnimationVe = <Loc_AnimationVe>{};
  elem_cep_pr: Loc_cep_PR = <Loc_cep_PR>{};
  elem_benef_pr: Loc_PR = <Loc_PR>{};

  constructor(
    public dialogRef: MatDialogRef<DialogComponent>,
    @Inject(MAT_DIALOG_DATA)  public data: any
  ) {}

  ngOnInit() {
    if (this.data.elem_mep != undefined) {
      this.isMepRP = true;
      this.element_mep = this.data.elem_mep;
    } else if (this.data.elem_suivi != undefined) {
      this.isSuiviRP = true;
      this.element_suivi = this.data.elem_suivi;
    } else if (this.data.elem_pms != undefined) {
      this.isDeletePms = true;
      this.element_pms = this.data.elem_pms;
    } else if (this.data.elem_contrat != undefined) {
      this.isDeleteContrat = true;
      this.element_contrat = this.data.elem_contrat;
    } else if (this.data.elem_suivi_bloc != undefined) {
      this.isDeleteSuiviBloc = true;
      this.elem_suivi_bloc = this.data.elem_suivi_bloc;
    } else if (this.data.elem_mep_bloc != undefined) {
      this.isDeleteMepBloc = true;
      this.elem_mep_bloc = this.data.elem_mep_bloc;
    } else if (this.data.elem_benef_bloc != undefined) {
      this.isDeleteBenefBloc = true;
      this.elem_benef_bloc = this.data.elem_benef_bloc;
    } else if (this.data.elem_parce_bloc != undefined) {
      this.isDeleteParceBloc = true;
      this.elem_parce_bloc = this.data.elem_parce_bloc;
    } else if(this.data.elem_suivi_pr != undefined) {
      this.isDeleteSuiviPr = true;
      this.elem_suivi_pr = this.data.elem_suivi_pr;
    } else if (this.data.elem_mep_pr != undefined) {
      this.isDeleteMepPR = true;
      this.elem_mep_pr = this.data.elem_mep_pr;
    } else if (this.data.elem_animationve_pr != undefined) {
      this.isDeleteAnimeVePR = true;
      this.elem_animeVe_pr = this.data.elem_animationve_pr;
    } else if (this.data.elem_cep_pr != undefined) {
      this.isDeleteCepPR = true;
      this.elem_cep_pr = this.data.elem_cep_pr;
    } else if (this.data.elem_benef_pr != undefined) {
      this.isDeletePR = true;
      this.elem_benef_pr = this.data.elem_benef_pr;
    }
  }
  onCancel() {
    this.dialogRef.close();
  }
  onConfirme() {
    this.dialogRef.close({response: 'ok'});
  }

}

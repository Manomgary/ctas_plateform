/**************************
 * 
 *************************************/
export interface Db_Culture_pms {
    code_culture: string,
    id_contrat: string,
    id_parce: string, 
    id_var: string,
    id_saison: string,
    id_annee: number,
    ddp: string,
    dt_creation: string,
    dt_modification: string,
    qsa : number,
    img_fact: string,
    dds: string,
    sfce: number,
    sc: string,
    nb_ligne: number,
    long_ligne: number,
    ea_id_variette: string,
    ea_autres: string,
    statuts: string,
    Etat: string
}
export interface Db_suivi_pms {
    id: string,
    code_culture: string, 
    ddp: string, 
    stc: string, 
    ec: string, 
    ex: number, 
    pb: string,
    img_cult: string, 
    name: string,
    path: string,
    controle: string,
    declaration: string,
    etat: string
}
export interface AddMepBloc {
    code_culture: string,
    code_culture_temp: string,
    id_parce: string, 
    id_espece: string, 
    id_var: string, 
    id_saison: string, 
    id_annee: number, 
    ddp: string, 
    qso: number, 
    dt_distribution: string,
    dds: string, 
    sfce: number, 
    nbre_ligne: number,
    long_ligne: number,
    usage: string,
    sc: string, 
    ea_autres: string, 
    ea_id_variette: string,
    dt_creation: string, 
    dt_modification: string, 
    status: string, 
    etat: string, 
    id_equipe: number,
    type: string
}
export interface UpdateSuiviBloc {
    code_sv: string, 
    id_culture: string, 
    ddp: string,
    stc: string, 
    ec: string,
    ql: number, 
    qr: number, 
    long_ligne: number, 
    nbre_ligne: number, 
    nbre_pied: number, 
    hauteur: number,
    img_cult: string, 
    dt_capture: string,
    ex: number,
    dt_creation: string,
    dt_modification: string,
    etat: string
}
export interface UpdateBenef {
    code_benef: string,
    img_benef: string,
    nom: string,
    prenom: string,
    sexe: string,
    dt_nais: string,
    dt_nais_vers: string,
    surnom: string,
    cin: number,
    dt_delivrance: string,
    lieu_delivrance: string,
    img_cin: string,
    contact: string,
    id_fkt: string,
    id_commune: string,
    village: string,
    dt_Insert: string, 
    etat: string,
    statut: string
}
export interface UpdateBenefActivPr {
    code_pr: string,
    code_pr_temp: string,
    id_proj: string, 
    id_activ: number, 
    id_benef: string, 
    id_bloc: string, 
    code_achat: string, 
    id_collaborateur: string, 
    id_tech: number, 
    etat: string,
    status: string
}
export interface UpdateParcePr {
    code_parce: string,
    code_parce_temp: string,
    id_bloc: string, 
    id_benef: string, 
    ref_gps: string, 
    lat: number, 
    log: number, 
    superficie: number, 
    id_commune: string, 
    id_fkt: string, 
    village: string, 
    anne_adheran: number, 
    dt_creation: string, 
    etat: string, 
    status: string
}
export interface UpdateAnimationVe {
    code: string,
    id_pr: string,
    id_fkt: string,
    id_commune: string, village: string,
    date_anim: string,
    nb_participant: number,
    nb_h: number,
    nb_f: number,
    nb_inf_25: number,
    type: string,
    img_piece: string,
    img_group_particip: string,
    id_tech_recenseur: number,
    etat: string,
    status: string
}
export interface UpdateAnimeSpecu {
    code_specu: number,
    id_anime_ve: string, 
    id_var: string, 
    id_espece: string, 
    quantite: number, 
    etat: string, 
    status: string
}
export interface UpdateMepPR {
    code_culture: string,
    code_culture_temp: string,
    id_parce: string,
    id_espece: string,
    id_var: string,
    id_saison: string,
    id_annee: number,
    ddp: string,
    qso: number,
    dt_distribution: string,
    dds: string,
    sfce: number,
    nbre_ligne: number,
    long_ligne: number,
    sc: string,
    ea_autres: string,
    ea_id_variette: string,
    dt_creation: string,
    dt_modification: string,
    status: string,
    etat: string,
    id_equipe: number,
    type: string
}
export interface UpdateSuiviMepPR {
    code_sv: string, 
    id_culture: string, 
    ddp: string, 
    stc: string, 
    ql: number, 
    qr: number, 
    long_ligne: number, 
    nbre_ligne: number, 
    nbre_pied: number, 
    hauteur: number, 
    ec: string, 
    img_cult: string, 
    dt_capture: string, 
    ex: number, 
    dt_creation: string, 
    dt_modification: string, 
    etat: string
}
export interface UpdatedBenefActivPms {
    code_benef_pms: string,
    code_pms_temp: string,
    code_achat: string, 
    id_proj: string, 
    id_benef: string, 
    id_activ: number, 
    id_association: string, 
    id_collaborateur: string,
    etat: string,
    status: string
}
export interface UpdateParcellePms {
    code_parce: string,
    code_parce_temp: string,
    id_assoc: string, 
    id_benef: string, 
    ref_gps: string, 
    lat: number, 
    log: number, 
    superficie: number, 
    id_fkt: string, 
    id_commune: string, 
    village: string, 
    anne_adheran: string, 
    indication: string, 
    etat: string, 
    status: string
}
export interface UpdateParceSaisonPms {
    code: string, 
    code_contrat: string,
    id_annee: number, 
    id_saison: string, 
    id_pms: string, 
    id_parce: string,
    ref_gps: string, 
    lat: number, 
    log: number,
    id_var: string, 
    objectif: number, 
    etat: string, 
    commentaire: string
}
export interface UpdatedBenefBloc {
    code_benef_bl: string, 
    code_benef_bl_temp: string,
    id_proj: string, 
    id_activ: number, 
    id_benef: string, 
    id_bloc: string, 
    code_achat: string, 
    id_collaborateur: string, 
    etat: string, 
    status: string

}
export interface UpdateParceBloc {
    code_parce: string, 
    code_parce_temp: string, 
    id_bloc: string, 
    id_benef: string, 
    ref_gps: string, 
    lat: number, 
    log: number, 
    superficie: number, 
    id_fkt: string, 
    id_commune: string, 
    village: string, 
    anne_adheran: string, 
    indication: string, 
    etat: string, 
    status: string
}
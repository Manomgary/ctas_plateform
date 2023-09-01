import { Injectable } from '@angular/core';

// Imports 
import { SqliteService } from '../sqlite.service'; 
import { DatabaseService } from '../database.service';
import { ACTIVE, DB_NAME, ISSYNC, ISUPDATE, SYNC, UPDATE, VALIDE } from 'src/app/utils/global-variables';
import { CapacitorSQLite, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { BehaviorSubject, from, Observable } from 'rxjs';
import { Equipe, ProjetEquipe, Utilisateurs } from 'src/app/utils/interface-bd';

@Injectable({
  providedIn: 'root'
})
export class LoadDataService {
  private dbReady: BehaviorSubject<boolean> = new BehaviorSubject(false);
  private dbName: string = DB_NAME;
  private db: SQLiteDBConnection = new SQLiteDBConnection(this.dbName, CapacitorSQLite);

  private users = new BehaviorSubject([]);
  private users_single = new BehaviorSubject([]);
  private active_projet = new BehaviorSubject([]);
  private region = new BehaviorSubject([]);
  private district = new BehaviorSubject([]);
  private commune = new BehaviorSubject([]);
  private fokontany = new BehaviorSubject([]);
  private projet = new BehaviorSubject([]);
  private projets = new BehaviorSubject([]);
  private collaborateur = new BehaviorSubject([]);
  private collabActive = new BehaviorSubject([]);
  private association = new BehaviorSubject([]);
  private bloc = new BehaviorSubject([]);
  private equipe = new BehaviorSubject([]);
  private projetEquipe = new BehaviorSubject([]);
  private beneficiaire = new BehaviorSubject([]);
  private beneficiaire_pms = new BehaviorSubject([]);
  private beneficiaire_bloc = new BehaviorSubject([]);

  constructor(private dbService: DatabaseService) {
    this.dbService.dbReady.subscribe(async isReady => {
      console.log("===== Contructeur laod service ====", isReady);
    });
  }

  async loadUsers(data: any) {
    
    if (this.dbService.dbReady.value) {
      let user: Utilisateurs[]  = [];
      const statement1 = `SELECT code_equipe, nom, prenom, sexe, dt_nais, num_perso,id_fonct, statuts 
                          FROM equipe 
                          WHERE statuts = "active" AND num_perso = "${data.userName}";`;

      await this.db.query(statement1).then(async res => {
        console.log(":::RESPONSE QUERY UTILISATEURS ::::");
        console.log(res);
        if (res.values.length >0) {
          const req = `SELECT E.code_equipe, E.nom, E.prenom, E.sexe, E.dt_nais, E.num_perso, U.code_util, U.id_equipe, U.img, U.id_fonct, 
                      U.fonction, U.type, U.role, U.nom_users, U.mot_passe, U.situation_compte, U.statuts_equipe, U.statuts_compte
                      FROM equipe E
                      INNER JOIN utilisateurs U ON U.id_equipe = E.code_equipe
                      WHERE E.statuts = "active" AND E.num_perso = "${data.userName}" AND U.mot_passe = "${data.passWord}"`;
          await this.db.query(req).then(res_req => {
            console.log(res_req);
            if (res_req.values.length > 0) {
              res_req.values.forEach((element: Utilisateurs, ind) => {
                user.push({
                  code_util: element.code_util,
                  id_equipe: element.id_equipe,
                  img: element.img, 
                  nom: element.nom, 
                  prenom: element.prenom, 
                  sexe: element.sexe,
                  dt_nais: element.dt_nais,
                  num_perso: element.num_perso,
                  id_fonct: element.id_fonct,
                  fonction: element.fonction,
                  type: element.type, 
                  role: element.role, 
                  nom_users: element.nom_users,
                  mot_passe: element.mot_passe, 
                  situation_compte: element.situation_compte, 
                  statuts_equipe: element.statuts_equipe,
                  statuts_compte: element.statuts_compte
                });
                if ((res_req.values.length - 1) === ind) {
                  this.users.next(user);
                  this.dbReady.next(true);
                }
              });
            } else {
              console.log("--Mot de passe incorrecte--");
              this.users.next([]);
            }
          });
        } else {
          console.log("--UserName n'existe pas--");
          this.users.next([]);
        }
      }); 

    } else {
      console.log("Db is not ready");
    }
  }
  async loadUserSingle() {
    if (this.dbService.dbReady.value) {
      let user: Utilisateurs[]  = [];
      const req = `SELECT E.code_equipe, E.nom, E.prenom, E.sexe, E.dt_nais, E.num_perso, U.code_util, U.id_equipe, U.img, U.id_fonct, 
                  U.fonction, U.type, U.role, U.nom_users, U.mot_passe, U.situation_compte, U.statuts_equipe, U.statuts_compte
                  FROM equipe E
                  INNER JOIN utilisateurs U ON U.id_equipe = E.code_equipe
                  WHERE E.statuts = "active";`;
      await this.db.query(req).then(res => {
        if (res.values.length > 0) {
          res.values.forEach((elem_user, ind) => {
            user.push(elem_user);
            if ((res.values.length - 1) === ind) {
              
            }
          });
          this.users_single.next(user);
          this.dbReady.next(true);
        }
      });
    }
  }

  /************************************
   * Service active, called by home.ts
   ************************************/
  loadAllProjet(data: any): Observable<any[]> {
    this.dbService.dbReady.subscribe(async isReady => {
      if (isReady) {
        let projet: any[] = [];
        let statement = `SELECT numero, code_proj, nom, description, ancronyme, logo, statuts FROM projet`;
        let req = ''

        if (!(Object.keys(data).length === 0)) {
          console.log("Object non vide!");
          req = statement + ` WHERE code_proj = "${ data.id_pr }" ORDER BY code_proj`;
        } else {
          console.log("Object vide");
          req = statement + ` ORDER BY code_proj`;
        }
  
        await this.db.query(req).then(res => {
          if (res.values.length) {
            res.values.forEach(elem => {
              projet.push({
                numero: elem.numero,
                code_proj: elem.code_proj, 
                nom: elem.nom,
                ancronyme: elem.ancronyme,
                description: elem.description,
                logo: elem.logo,
                statuts: elem.statuts
              });
            });
            this.projets.next(projet);
          } else console.log("Aucun enregistrement pour le table projet");
        });
      }
    });
    return this.projets.asObservable();
  }

  loadActiveProjet(data: any): Observable<any[]> {

    this.dbService.dbReady.subscribe(async isReady => {
      if (isReady) {
        let act_pr: any[]  = [];
        console.log(this.dbService.dbReady.value);
        const statement = `SELECT PEV.code, PEV.id_projet AS id_proj, PRJ.nom, PEV.id_equipe, PEV.id_volet, PEV.status_pev AS statuts, A.code_act AS id_activ, A.intitule, A.description
                          FROM projet_equipe_volet PEV
                          INNER JOIN activite A ON A.id_volet = PEV.id_volet
                          INNER JOIN projet PRJ ON PRJ.code_proj = PEV.id_projet AND PRJ.statuts = "activer"
                          INNER JOIN projet_equipe PE ON PE.id_projet = PEV.id_projet AND PE.id_equipe = PEV.id_equipe AND PE.status_pe = "active"
                          WHERE PEV.status_pev = "active" AND PEV.id_projet = "${ data.id_projet }" AND PEV.id_equipe = ${ data.code_equipe };`;
        await this.db.query(statement).then(res => {
          console.log(":::RESPONSE QUERY Activite Projet ::::");
          if (res.values.length >0) {
            console.log(res.values);
            res.values.forEach((element: any) => {
              act_pr.push({
                code: element.code,
                id_proj: element.id_proj,
                nom: element.nom,
                id_activ: element.id_activ,
                intitule: element.intitule,
                description: element.description,
                statuts: element.statuts
              });
            });
            this.active_projet.next(act_pr);
            this.dbReady.next(true);
            console.log(this.active_projet);
          } else console.log("Aucune activiter projet!!!");
        }); 
      }
    });
    return this.active_projet.asObservable();
  }

  loadRegion(): Observable<any[]> {
    this.dbService.dbReady.subscribe(async (isReady) => {
      if (isReady) {
        this.region.next([]);
        let reg: any[]  = [];
        console.log(this.dbService.dbReady.value);
        const statement = `SELECT * FROM zone_region;`;
        await this.db.query(statement).then(res => {
          console.log(":::RESPONSE QUERY Region ::::");
          if (res.values.length >0) {
            console.log(res.values);
            res.values.forEach((element: any) => {
              reg.push({
                code_reg: element.code_reg,
                nom_reg: element.nom_reg
              });
            });
            this.region.next(reg);
            console.log(this.region);
          } else {
            console.log("Aucune region!!!");
            this.region.next([]);
          }
        }); 
      }
    });
    return this.region.asObservable();
  }

  loadDistrict(id_region): Observable<any[]> {
    this.dbService.dbReady.subscribe(async (isReady) => {
      if (isReady) {
        this.district.next([]);
        let dist: any[]  = [];
        console.log(this.dbService.dbReady.value);
        const statement = `SELECT  code_dist, nom_dist, id_reg 
                            FROM zone_district
                            WHERE id_reg = "${id_region}" ;`;
        await this.db.query(statement).then(res => {
          console.log(":::RESPONSE QUERY DISTRICT ::::");
          if (res.values.length >0) {
            console.log(res.values);
            res.values.forEach((element: any) => {
              dist.push({
                code_dist: element.code_dist, 
                nom_dist: element.nom_dist, 
                id_reg: element.id_reg
              });
            });
            this.district.next(dist);
            console.log(this.district);
          } else {
            console.log("Aucune District!!!");
            this.district.next([]);
          }
        }); 
      }
    });
    return this.district.asObservable();
  }

  async loadAllDistrict() {
    const statement = `SELECT  code_dist, nom_dist, id_reg 
                            FROM zone_district;`;
    return await this.db.query(statement);
  }

  async loadCommune(id_dist) {
    console.log("!!!!!!!!Load commune Code dist::::::::", id_dist);
    let statement = `SELECT R.nom_reg, C.id_dist, D.nom_dist,  C.code_com, C.nom_com
                        FROM zone_commune C 
                        INNER JOIN zone_district D ON D.code_dist = C.id_dist
                        INNER JOIN zone_region R ON R.code_reg = D.id_reg`;
    if (Object.keys(id_dist).length > 0 && id_dist.code_dist != undefined) {
      statement += ` WHERE C.id_dist = "${id_dist.code_dist}";`;
    }
    return await this.db.query(statement); 
  }

  async loadFokontany(id_commune) {
    let statement = `SELECT D.id_reg, R.nom_reg, C.id_dist, D.nom_dist, F.id_com, C.nom_com, F.code_fkt, F.nom_fkt 
    FROM zone_fonkotany F 
    INNER JOIN zone_commune C ON C.code_com = F.id_com 
    INNER JOIN zone_district D ON D.code_dist = C.id_dist
    INNER JOIN zone_region R ON R.code_reg = D.id_reg`;
    if (Object.keys(id_commune).length > 0 && id_commune.code_commune != undefined) {
      statement += ` WHERE C.code_com = "${ id_commune.code_commune  }" ORDER BY R.nom_reg, D.nom_dist, C.nom_com, F.nom_fkt;`;
    } else statement += ` ORDER BY R.nom_reg, D.nom_dist, C.nom_com, F.nom_fkt;`;
    return await this.db.query(statement);
  }

  /**loadFokontany(id_commune): Observable<any[]> {
    this.dbService.dbReady.subscribe(async (isReady) => {
      if (isReady) {
        this.fokontany.next([]);
        let fkt: any[]  = [];
        console.log(this.dbService.dbReady.value);
        const statement = `SELECT D.id_reg, R.nom_reg, C.id_dist, D.nom_dist, F.id_com, C.nom_com, F.code_fkt, F.nom_fkt 
                          FROM zone_fonkotany F 
                          INNER JOIN zone_commune C ON C.code_com = F.id_com 
                          INNER JOIN zone_district D ON D.code_dist = C.id_dist
                          INNER JOIN zone_region R ON R.code_reg = D.id_reg 
                          WHERE C.code_com = ${ id_commune  } ORDER BY R.nom_reg, D.nom_dist, C.nom_com, F.nom_fkt;`;
        await this.db.query(statement).then(res => {
          console.log(":::RESPONSE QUERY FOKONTANY ::::");
          if (res.values.length >0) {
            console.log(res.values);
            res.values.forEach((element: any) => {
              fkt.push({
                nom_reg: element.nom_reg,
                id_dist: element.id_dist, 
                nom_dist: element.nom_dist,  
                id_com: element.id_com, 
                nom_com: element.nom_com,
                code_fkt: element.code_fkt,
                nom_fkt: element.nom_fkt
              });
            });
            this.fokontany.next(fkt);
            console.log(this.fokontany);
          } else {
            console.log("Aucune Fokontany Disponible!!!");
            this.fokontany.next([]);
          }
        }); 
      }
    });
    return this.fokontany.asObservable();
  }*/

  loadCollaborateurs(): Observable<any[]> {
    this.dbService.dbReady.subscribe(async isReady => {
      if (isReady) {
        let collab: any[] = [];
        const statement = `SELECT * FROM collaborateur;`;
  
        await this.db.query(statement).then(res => {
          if (res.values.length) {
            res.values.forEach(elem => {
              collab.push({
                code_col: elem.code_col, 
                nom: elem.nom, 
                description: elem.description,
                ancronyme: elem.ancronyme
              });
            });
            this.collaborateur.next(collab);
          } else console.log("Aucun enregistrement pour le table collaborateur");
        });
      }
    });
    return this.collaborateur.asObservable();
  }

  async loadCollaborateursActivite(code_activite: any) {
    let req_ = `SELECT CA.code, CA.id_col, COL.nom, COL.description, COL.ancronyme, CA.id_activ 
                FROM collaborateur_activ CA
                INNER JOIN collaborateur COL ON COL.code_col = CA.id_col
                WHERE CA.id_activ = ${code_activite}`;
    return await this.db.query(req_);
  }

  async loadAssociation(data: any) {
    let req: string = ``;
    /**
     * Selectionner des associations il ya des beneficiaires et de Présidents Association(PA = Col06)
     */
    let statement1 = `SELECT ASS.numero, ASS.id_prjt, P.code_proj, P.nom as nom_pr, ASS.id_fkt, FKT.nom_fkt, ASS.code_ass, ASS.nom as nom_ass, ASS.ancronyme, ASS.id_tech, E.nom || ' ' || E.prenom AS technicien, ASS.status, COUNT(BAPMS.code_benef_pms) as nb_benef, B.nom as nom_pa, B.prenom, B.sexe, B.surnom, B.cin, B.dt_delivrance, B.lieu_delivrance, B.img_benef 
                      FROM association ASS 
                      INNER JOIN projet P ON P.code_proj = ASS.id_prjt 
                      INNER JOIN zone_fonkotany FKT ON FKT.code_fkt = ASS.id_fkt 
                      INNER JOIN benef_activ_pms BAPMS ON BAPMS.id_association = ASS.code_ass 
                      INNER JOIN benef_activ_pms BPMS_PA ON (BPMS_PA.id_association = ASS.code_ass AND 	BPMS_PA.id_collaborateur = "Col06") 
                      INNER JOIN beneficiaire B ON B.code_benef = BPMS_PA.id_benef
                      INNER JOIN equipe E ON E.code_equipe = ASS.id_tech`;
        /**
     * Selectionner des associations il ya des beneficiaires mais il n' y a pas des Présidents Association
     */
    let statement2 = `SELECT ASS.numero, ASS.id_prjt, P.code_proj, P.nom as nom_pr, ASS.id_fkt, FKT.nom_fkt, ASS.code_ass, ASS.nom as nom_ass, ASS.ancronyme, ASS.id_tech, E.nom || ' ' || E.prenom AS technicien, ASS.status, COUNT(BAPMS.code_benef_pms) as nb_benef, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL
                      FROM association ASS 
                      INNER JOIN projet P ON P.code_proj = ASS.id_prjt 
                      INNER JOIN zone_fonkotany FKT ON FKT.code_fkt = ASS.id_fkt 
                      INNER JOIN benef_activ_pms BAPMS ON BAPMS.id_association = ASS.code_ass 
                      INNER JOIN equipe E ON E.code_equipe = ASS.id_tech`;   
    /**
     * Selectionner des associations il n'y a aucun beneficiaires
     */
    let statement3 = `SELECT ASS.numero, ASS.id_prjt, P.code_proj, P.nom as nom_pr, ASS.id_fkt, FKT.nom_fkt, ASS.code_ass, ASS.nom as nom_ass, ASS.ancronyme, ASS.id_tech, E.nom || ' ' || E.prenom AS technicien, ASS.status, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL
                      FROM association ASS 
                      INNER JOIN projet P ON P.code_proj = ASS.id_prjt 
                      INNER JOIN zone_fonkotany FKT ON FKT.code_fkt = ASS.id_fkt 
                      INNER JOIN equipe E ON E.code_equipe = ASS.id_tech`;  

    if (!(Object.keys(data).length === 0)) {
      let stat1 = statement1 + ` WHERE ASS.id_fkt = "${data.id_fkt}" AND ASS.id_prjt = "${data.code_pr}" AND E.code_equipe = ${data.code_equipe} 
                                  GROUP BY ASS.code_ass`;

      let stat2 = statement2 + `  WHERE ASS.id_fkt = "${data.id_fkt}" AND ASS.id_prjt = "${data.code_pr}" AND E.code_equipe = ${data.code_equipe} 
                                    AND  ASS.code_ass NOT IN (SELECT ASS.code_ass
                                                            FROM association ASS
                                                            INNER JOIN projet P ON P.code_proj = ASS.id_prjt 
                                                            INNER JOIN zone_fonkotany FKT ON FKT.code_fkt = ASS.id_fkt 
                                                            INNER JOIN benef_activ_pms BAPMS ON BAPMS.id_association = ASS.code_ass 
                                                            INNER JOIN benef_activ_pms BPMS_PA ON (BPMS_PA.id_association = ASS.code_ass AND 	BPMS_PA.id_collaborateur = "Col06"))
                                  GROUP BY ASS.code_ass`;

      let stat3 = statement3 + `  WHERE ASS.id_fkt = "${data.id_fkt}" AND ASS.id_prjt = "${data.code_pr}" AND E.code_equipe = ${data.code_equipe} 
                              AND ASS.code_ass NOT IN(SELECT ASS.code_ass
                                FROM association ASS 
                                INNER JOIN projet P ON P.code_proj = ASS.id_prjt 
                                INNER JOIN zone_fonkotany FKT ON FKT.code_fkt = ASS.id_fkt 
                                INNER JOIN benef_activ_pms BAPMS ON BAPMS.id_association = ASS.code_ass
                                GROUP BY ASS.code_ass)
                              GROUP BY ASS.code_ass;`;
      req = stat1 + ` UNION ` + stat2 + ` UNION ` + stat3;
    }
    return await this.db.query(req);
  }

  async loadParcelle(data: any) {
    let stat = `SELECT SS_PRC.id_annee, SS_PRC.code AS code_contrat, SS_PRC.id_saison, SS_PRC.id_pms, fkt.nom_fkt AS fkt_association, BPMS.id_association, ASS.nom As nom_ass, BPMS.code_benef_pms, BPMS.code_achat, B.nom, B.prenom, ASS_PRC.code_parce, ASS_PRC.code_parce_temp, ASS_PRC.id_benef, ASS_PRC.ref_gps, ASS_PRC.lat, ASS_PRC.log, ASS_PRC.superficie, ASS_PRC.id_fkt, ASS_PRC.status
              FROM assoc_parce ASS_PRC
              INNER JOIN beneficiaire B ON B.code_benef = ASS_PRC.id_benef 
              INNER JOIN association ASS ON ASS.code_ass = ASS_PRC.id_assoc
              INNER JOIN equipe EQ ON EQ.code_equipe = ASS.id_tech  AND EQ.statuts = "active"
              INNER JOIN projet PRJ ON PRJ.code_proj = ASS.id_prjt AND PRJ.statuts = "activer"
              INNER JOIN projet_equipe PE ON PE.id_projet = PRJ.code_proj AND PE.id_equipe = EQ.code_equipe AND PE.status_pe = "active"
              INNER JOIN zone_fonkotany fkt ON fkt.code_fkt = ASS.id_fkt
              INNER JOIN benef_activ_pms BPMS ON (BPMS.id_benef = ASS_PRC.id_benef AND BPMS.id_association = ASS_PRC.id_assoc) 
              INNER JOIN assoc_parce_saison SS_PRC ON SS_PRC.id_parce = ASS_PRC.code_parce`;
    if (!(Object.keys(data).length === 0)) {
      if (data.code_ass != undefined) {
        stat += ` WHERE ASS_PRC.status = "active" AND B.statut = "active" AND BPMS.status = "active" AND ASS_PRC.id_assoc = "${data.code_ass}"`;
      } else if (data.code_benef_pms != undefined) {
        stat += ` WHERE ASS_PRC.status = "active" AND B.statut = "active" AND BPMS.status = "active" AND BPMS.code_benef_pms = "${data.code_benef_pms}"`;
      }
    }
    return await this.db.query(stat);
  }

  async loadAllContratPms(data: any) {
    let state = `SELECT SS_PRC.code, SS_PRC.code_contrat, SS_PRC.id_annee, SS_PRC.id_saison, SS_PRC.id_pms, ASS.code_ass, SS_PRC.id_parce, SS_PRC.ref_gps, SS_PRC.lat, SS_PRC.log, SS_PRC.id_var, SS_PRC.objectif, SS_PRC.etat, SS_PRC.commentaire, BPMS.code_benef_pms, BNF.nom, BNF.prenom,
              CASE WHEN SS_PRC.id_var IS NOT NULL THEN (SELECT (ESP.nom_espece || ' ' || VAR.nom_var) AS variette FROM variette VAR INNER JOIN espece ESP ON ESP.code_espece = VAR.id_espece WHERE VAR.code_var = SS_PRC.id_var) END AS variette
              FROM assoc_parce_saison SS_PRC
              INNER JOIN benef_activ_pms BPMS ON BPMS.code_benef_pms = SS_PRC.id_pms AND BPMS.status = "active"
              INNER JOIN association ASS ON ASS.code_ass = BPMS.id_association AND ASS.status = "active"
              INNER JOIN beneficiaire BNF ON BNF.code_benef = BPMS.id_benef AND BNF.statut = "active"
              INNER JOIN projet PRJ ON PRJ.code_proj = BPMS.id_proj  AND PRJ.statuts = "activer"
              WHERE ASS.code_ass = "${data.code_ass}"`;
    return await this.db.query(state);
  }

  async loadParcelleSaison(data: any) {
    let req: string = ``;
    let state1 = `SELECT PRC_SS.code AS code_parce_saison, PRC_SS.code_contrat, PRC_SS.id_annee, PRC_SS.id_saison, PRC_SS.id_pms, PRC_SS.id_parce, PRC_SS.ref_gps AS ref_gps_saison, PRC_SS.lat AS lat_saison, PRC_SS.log AS log_saison, PRC_SS.id_var, PRC_SS.objectif, PRC_SS.etat AS etat_contrat, PRC_SS.commentaire, BPMS.code_pms_temp, BPMS.code_achat, BNF.nom, BNF.prenom, BNF.dt_nais, BNF.dt_nais_vers, BNF.sexe, BNF.cin, ASS.code_ass, ASS.nom AS association, ANAG.annee_du, ANAG.annee_au, SS.intitule AS saison,
                CASE WHEN PRC_SS.id_var IS NOT NULL THEN (SELECT E.code_espece FROM variette V INNER JOIN espece E ON E.code_espece = V.id_espece WHERE V.code_var = PRC_SS.id_var) END AS code_espece,
                CASE WHEN PRC_SS.id_var IS NOT NULL THEN (SELECT (E.nom_espece || ' ' || V.nom_var) AS nom_var FROM variette V INNER JOIN espece E ON E.code_espece = V.id_espece WHERE V.code_var = PRC_SS.id_var) END AS variette,
                CASE WHEN PRC_SS.id_var IS NOT NULL THEN (SELECT E.unite_objectif FROM variette V INNER JOIN espece E ON E.code_espece = V.id_espece WHERE V.code_var = PRC_SS.id_var) END AS unite_objectif,
                CASE WHEN BNF.dt_nais IS NOT NULL THEN BNF.dt_nais 
                WHEN BNF.dt_nais_vers IS NOT NULL THEN BNF.dt_nais_vers END AS date_naissance,
                ASS_PRC.code_parce, ASS_PRC.code_parce_temp, ASS_PRC.id_assoc AS id_assoc_prc, ASS_PRC.id_benef AS id_benef_prc, ASS_PRC.ref_gps AS ref_gps_parce, ASS_PRC.lat AS lat_parce, ASS_PRC.log AS log_parce, ASS_PRC.superficie, ASS_PRC.id_fkt, ASS_PRC.indication, ASS_PRC.status AS status_prc, ASS_PRC.etat AS etat_parce, ASS_PRC.village,
                CASE WHEN PRC_SS.ref_gps IS NOT NULL THEN PRC_SS.ref_gps
                WHEN ASS_PRC.ref_gps IS NOT NULL THEN ASS_PRC.ref_gps
                ELSE NULL END AS ref_gps,
                CASE WHEN PRC_SS.lat IS NOT NULL THEN PRC_SS.lat
                ELSE ASS_PRC.lat END AS latitude, 
                CASE WHEN PRC_SS.log IS NOT NULL THEN PRC_SS.log
                ELSE ASS_PRC.log END AS logitude,
                CASE WHEN ASS_PRC.id_fkt IS NOT NULL THEN (SELECT ZREG.code_reg FROM zone_fonkotany ZFKT INNER JOIN zone_commune ZCOM ON ZCOM.code_com = ZFKT.id_com INNER JOIN zone_district ZDIST ON ZDIST.code_dist = ZCOM.id_dist INNER JOIN zone_region ZREG ON ZREG.code_reg = ZDIST.id_reg WHERE ZFKT.code_fkt = ASS_PRC.id_fkt) 
                WHEN ASS_PRC.id_commune IS NOT NULL AND ASS_PRC.village IS NOT NULL THEN (SELECT REG.code_reg FROM zone_commune COM INNER JOIN zone_district DIST ON DIST.code_dist = COM.id_dist INNER JOIN zone_region REG ON REG.code_reg = DIST.id_reg WHERE  COM.code_com = ASS_PRC.id_commune) END AS code_reg,
                CASE WHEN ASS_PRC.id_fkt IS NOT NULL THEN (SELECT ZCOM.id_dist FROM zone_fonkotany ZFKT INNER JOIN zone_commune ZCOM ON ZCOM.code_com = ZFKT.id_com INNER JOIN zone_district ZDIST ON ZDIST.code_dist = ZCOM.id_dist WHERE ZFKT.code_fkt = ASS_PRC.id_fkt) 
                WHEN ASS_PRC.id_commune IS NOT NULL AND ASS_PRC.village IS NOT NULL THEN (SELECT DIST.code_dist FROM zone_commune COM INNER JOIN zone_district DIST ON DIST.code_dist = COM.id_dist WHERE  COM.code_com = ASS_PRC.id_commune) END AS code_dist,
                CASE WHEN ASS_PRC.id_fkt IS NOT NULL THEN (SELECT ZDIST.nom_dist FROM zone_fonkotany ZFKT INNER JOIN zone_commune ZCOM ON ZCOM.code_com = ZFKT.id_com INNER JOIN zone_district ZDIST ON ZDIST.code_dist = ZCOM.id_dist WHERE ZFKT.code_fkt = ASS_PRC.id_fkt) 
                WHEN ASS_PRC.id_commune IS NOT NULL AND ASS_PRC.village IS NOT NULL THEN (SELECT DIST.nom_dist FROM zone_commune COM INNER JOIN zone_district DIST ON DIST.code_dist = COM.id_dist WHERE  COM.code_com = ASS_PRC.id_commune) END AS nom_dist,
                CASE WHEN ASS_PRC.id_fkt IS NOT NULL THEN (SELECT ZCOM.code_com FROM zone_fonkotany ZFKT INNER JOIN zone_commune ZCOM ON ZCOM.code_com = ZFKT.id_com WHERE ZFKT.code_fkt = ASS_PRC.id_fkt) 
                WHEN ASS_PRC.id_commune IS NOT NULL AND ASS_PRC.village IS NOT NULL THEN (SELECT COM.code_com FROM zone_commune COM WHERE  COM.code_com = ASS_PRC.id_commune) END AS code_commune,
                CASE WHEN ASS_PRC.id_fkt IS NOT NULL THEN (SELECT ZCOM.nom_com FROM zone_fonkotany ZFKT INNER JOIN zone_commune ZCOM ON ZCOM.code_com = ZFKT.id_com WHERE ZFKT.code_fkt = ASS_PRC.id_fkt) 
                WHEN ASS_PRC.id_commune IS NOT NULL AND ASS_PRC.village IS NOT NULL THEN (SELECT COM.nom_com FROM zone_commune COM WHERE  COM.code_com = ASS_PRC.id_commune) END AS nom_commune,
                CASE WHEN ASS_PRC.id_fkt IS NOT NULL THEN (SELECT ZFKT.nom_fkt FROM zone_fonkotany ZFKT WHERE ZFKT.code_fkt = ASS_PRC.id_fkt) 
                WHEN ASS_PRC.village IS NOT NULL AND ASS_PRC.id_fkt IS NULL THEN ASS_PRC.village
                END AS fokontany_prc
                FROM assoc_parce_saison PRC_SS
                INNER JOIN benef_activ_pms BPMS ON BPMS.code_benef_pms = PRC_SS.id_pms AND BPMS.status = "active"
                INNER JOIN beneficiaire BNF ON BNF.code_benef = BPMS.id_benef AND BNF.statut = "active"
                INNER JOIN association ASS ON ASS.code_ass = BPMS.id_association AND ASS.status = "active"
                INNER JOIN annee_agricole ANAG ON ANAG.code = PRC_SS.id_annee
                INNER JOIN saison SS ON SS.code_saison = PRC_SS.id_saison
                INNER JOIN assoc_parce ASS_PRC ON ASS_PRC.code_parce = PRC_SS.id_parce AND ASS_PRC.status = "active"
                INNER JOIN benef_activ_pms BPMS_PRC ON BPMS_PRC.id_benef = ASS_PRC.id_benef AND BPMS_PRC.id_proj = "${data.code_prj}" AND BPMS_PRC.code_benef_pms = BPMS.code_benef_pms AND BPMS_PRC.status = "active"
                WHERE PRC_SS.id_parce IS NOT NULL AND ASS.code_ass = "${data.code_ass}"`;

    let state2 = `SELECT PRC_SS.code AS code_parce_saison, PRC_SS.code_contrat, PRC_SS.id_annee, PRC_SS.id_saison, PRC_SS.id_pms, PRC_SS.id_parce, PRC_SS.ref_gps AS ref_gps_saison, PRC_SS.lat AS lat_saison, PRC_SS.log AS log_saison, PRC_SS.id_var, PRC_SS.objectif, PRC_SS.etat AS etat_contrat, PRC_SS.commentaire, BPMS.code_pms_temp, BPMS.code_achat, BNF.nom, BNF.prenom, BNF.dt_nais, BNF.dt_nais_vers, BNF.sexe, BNF.cin, ASS.code_ass, ASS.nom AS association, ANAG.annee_du, ANAG.annee_au, SS.intitule AS saison,
                CASE WHEN PRC_SS.id_var IS NOT NULL THEN (SELECT E.code_espece FROM variette V INNER JOIN espece E ON E.code_espece = V.id_espece WHERE V.code_var = PRC_SS.id_var) END AS code_espece,
                CASE WHEN PRC_SS.id_var IS NOT NULL THEN (SELECT (E.nom_espece || ' ' || V.nom_var) AS nom_var FROM variette V INNER JOIN espece E ON E.code_espece = V.id_espece WHERE V.code_var = PRC_SS.id_var) END AS variette,
                CASE WHEN PRC_SS.id_var IS NOT NULL THEN (SELECT E.unite_objectif FROM variette V INNER JOIN espece E ON E.code_espece = V.id_espece WHERE V.code_var = PRC_SS.id_var) END AS unite_objectif,
                CASE WHEN BNF.dt_nais IS NOT NULL THEN BNF.dt_nais 
                WHEN BNF.dt_nais_vers IS NOT NULL THEN BNF.dt_nais_vers END AS date_naissance,
                NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL
                FROM assoc_parce_saison PRC_SS
                INNER JOIN benef_activ_pms BPMS ON BPMS.code_benef_pms = PRC_SS.id_pms AND BPMS.status = "active"
                INNER JOIN beneficiaire BNF ON BNF.code_benef = BPMS.id_benef AND BNF.statut = "active"
                INNER JOIN association ASS ON ASS.code_ass = BPMS.id_association AND ASS.status = "active"
                INNER JOIN annee_agricole ANAG ON ANAG.code = PRC_SS.id_annee
                INNER JOIN saison SS ON SS.code_saison = PRC_SS.id_saison
                WHERE PRC_SS.id_parce IS NULL AND ASS.code_ass = "${data.code_ass}"`;
    if (data.code_pms != undefined) {
      req = state1 + ` AND BPMS.code_benef_pms =  "${data.code_pms}" ` + ` UNION ` + state2 + ` AND BPMS.code_benef_pms =  "${data.code_pms}"`;
    } else {
      req = state1 + ` UNION ` + state2;
    }
    
    return await this.db.query(req);
  }

  async loadCodeParceSaisonContrat(data: any) {
    let state = `SELECT PRC_SS.code, PRC_SS.code_contrat, PRC_SS.id_annee, PRC_SS.id_saison, PRC_SS.id_pms, PRC_SS.id_parce, PRC_SS.ref_gps, PRC_SS.lat, PRC_SS.log, PRC_SS.id_var, PRC_SS.objectif, PRC_SS.etat, PRC_SS.commentaire
              FROM assoc_parce_saison PRC_SS
              INNER JOIN benef_activ_pms BPMS ON BPMS.code_benef_pms = PRC_SS.id_pms AND BPMS.status = "active"
              INNER JOIN association ASS ON ASS.code_ass = BPMS.id_association
              WHERE PRC_SS.id_annee = ${data.code_annee} AND PRC_SS.id_saison = "${data.code_saison}" AND ASS.code_ass = "${data.code_assoc}"
              ORDER BY PRC_SS.code_contrat`;
    return await this.db.query(state);
  }

  async loadCodeParceAssoc(data: any) {
    let state = `SELECT ASS_PRC.code_parce, ASS_PRC.code_parce_temp, ASS_PRC.id_assoc, ASS_PRC.id_benef, ASS_PRC.ref_gps, ASS_PRC.lat, ASS_PRC.log, ASS_PRC.superficie, ASS_PRC.id_fkt, ASS_PRC.id_commune, ASS_PRC.village, ASS_PRC.anne_adheran, ASS_PRC.indication, ASS_PRC.etat, ASS_PRC.status
                FROM assoc_parce ASS_PRC
                WHERE ASS_PRC.status = "active" AND ASS_PRC.code_parce IN(SELECT PRC_SS.id_parce
                      FROM assoc_parce_saison PRC_SS
                      INNER JOIN benef_activ_pms BPMS ON BPMS.code_benef_pms = PRC_SS.id_pms AND BPMS.status = "active"
                      INNER JOIN association ASS ON ASS.code_ass = BPMS.id_association
                      WHERE PRC_SS.id_annee = ${data.code_annee} AND PRC_SS.id_saison = "${data.code_saison}" AND ASS.code_ass = "${data.code_assoc}")
                ORDER BY ASS_PRC.code_parce_temp`;
    return await this.db.query(state);
  }

  async loadBlocEquipeZone(data: any) {
    const statement = `SELECT BL.ordre, BL.code_bloc, BL.nom AS nom_bloc, BL.ancronyme, BL.id_district, BL.id_prjt, BL.id_tech, BL.status , EQ.nom, EQ.prenom, EQ.sexe, EQ.cin, DIST.nom_dist, (SELECT COUNT(*) FROM benef_activ_bl BBL WHERE BBL.id_bloc = BL.code_bloc AND BBL.status= "active") AS nb_benef, 
                      (SELECT COUNT(*) FROM bloc_parce PRC WHERE PRC.id_bloc = BL.code_bloc AND PRC.status = "active") AS nb_parce
                      FROM bloc BL
                      INNER JOIN equipe EQ ON EQ.code_equipe = BL.id_tech AND EQ.statuts = "active"
                      INNER JOIN zone_district DIST ON DIST.code_dist = BL.id_district
                      WHERE BL.id_tech = ${data.id_tech} AND BL.id_prjt = "${data.code_projet}" AND BL.id_district = "${data.code_dist}"`;
    return await this.db.query(statement);
  }

  async loadBenefBloc(data: any) {
    let req = `SELECT BABL.code_benef_bl, BABL.code_benef_bl_temp, BABL.id_proj, BABL.id_activ, BABL.id_benef, BABL.id_bloc, BABL.code_achat, BABL.id_collaborateur, BABL.etat AS etat_benef_bloc, BABL.status, BNF.code_benef, BNF.img_benef, BNF.nom, BNF.prenom, BNF.sexe, BNF.dt_nais, BNF.dt_nais_vers, BNF.surnom, BNF.cin, BNF.dt_delivrance, BNF.lieu_delivrance, BNF.img_cin, BNF.contact, BNF.id_fkt, BNF.id_commune, BNF.village, BNF.dt_Insert AS dt_insert_bnf, BNF.etat AS etat_bnf, BNF.statut AS status_bnf, (SELECT COUNT(*) FROM bloc_parce B_PRC WHERE B_PRC.id_benef = BNF.code_benef AND B_PRC.id_bloc = BABL.id_bloc AND B_PRC.status = "active") AS nb_parce,  (SELECT SUM(B_PRC.superficie) FROM bloc_parce B_PRC WHERE B_PRC.id_benef = BNF.code_benef AND B_PRC.id_bloc = BABL.id_bloc AND B_PRC.status = "active") AS sum_parce, BL.nom AS nom_bloc,
                CASE WHEN BNF.dt_nais IS NOT NULL THEN BNF.dt_nais
                WHEN BNF.dt_nais_vers IS NOT NULL THEN BNF.dt_nais_vers
                ELSE NULL END AS date_naissance,
                CASE WHEN BNF.id_fkt IS NOT NULL THEN (SELECT DIST.id_reg FROM zone_fonkotany FKT INNER JOIN zone_commune COM ON COM.code_com = FKT.id_com INNER JOIN zone_district DIST ON DIST.code_dist = COM.id_dist WHERE FKT.code_fkt = BNF.id_fkt)
                WHEN BNF.id_commune IS NOT NULL AND BNF.village IS NOT NULL THEN (SELECT ZDIST.id_reg FROM zone_commune ZCOM INNER JOIN zone_district ZDIST ON ZDIST.code_dist = ZCOM.id_dist WHERE ZCOM.code_com = BNF.id_commune) ELSE NULL END AS code_reg,
                CASE WHEN BNF.id_fkt IS NOT NULL THEN (SELECT DIST.code_dist FROM zone_fonkotany FKT INNER JOIN zone_commune COM ON COM.code_com = FKT.id_com INNER JOIN zone_district DIST ON DIST.code_dist = COM.id_dist WHERE FKT.code_fkt = BNF.id_fkt)
                WHEN BNF.id_commune IS NOT NULL AND BNF.village IS NOT NULL THEN (SELECT ZDIST.code_dist FROM zone_commune ZCOM INNER JOIN zone_district ZDIST ON ZDIST.code_dist = ZCOM.id_dist WHERE ZCOM.code_com = BNF.id_commune) ELSE NULL END AS code_dist,
                CASE WHEN BNF.id_fkt IS NOT NULL THEN (SELECT DIST.nom_dist FROM zone_fonkotany FKT INNER JOIN zone_commune COM ON COM.code_com = FKT.id_com INNER JOIN zone_district DIST ON DIST.code_dist = COM.id_dist WHERE FKT.code_fkt = BNF.id_fkt)
                WHEN BNF.id_commune IS NOT NULL AND BNF.village IS NOT NULL THEN (SELECT ZDIST.nom_dist FROM zone_commune ZCOM INNER JOIN zone_district ZDIST ON ZDIST.code_dist = ZCOM.id_dist WHERE ZCOM.code_com = BNF.id_commune) ELSE NULL END AS nom_dist,
                CASE WHEN BNF.id_fkt IS NOT NULL THEN (SELECT COM.code_com FROM zone_fonkotany FKT INNER JOIN zone_commune COM ON COM.code_com = FKT.id_com  WHERE FKT.code_fkt = BNF.id_fkt)
                WHEN BNF.id_commune IS NOT NULL AND BNF.village IS NOT NULL THEN (SELECT ZCOM.code_com FROM zone_commune ZCOM WHERE ZCOM.code_com = BNF.id_commune) ELSE NULL END AS code_commune,
                CASE WHEN BNF.id_fkt IS NOT NULL THEN (SELECT COM.nom_com FROM zone_fonkotany FKT INNER JOIN zone_commune COM ON COM.code_com = FKT.id_com  WHERE FKT.code_fkt = BNF.id_fkt)
                WHEN BNF.id_commune IS NOT NULL AND BNF.village IS NOT NULL THEN (SELECT ZCOM.nom_com FROM zone_commune ZCOM WHERE ZCOM.code_com = BNF.id_commune) ELSE NULL END AS commune,
                CASE WHEN BNF.id_fkt IS NOT NULL THEN (SELECT ZFKT.nom_fkt FROM zone_fonkotany ZFKT WHERE ZFKT.code_fkt = BNF.id_fkt)
                WHEN BNF.village IS NOT NULL THEN BNF.village ELSE NULL END AS fokontany
                FROM benef_activ_bl BABL
                INNER JOIN projet PRJ ON PRJ.code_proj = BABL.id_proj AND PRJ.statuts = "activer"
                INNER JOIN beneficiaire BNF ON BNF.code_benef = BABL.id_benef AND BNF.statut = "active"
                INNER JOIN bloc BL ON BL.code_bloc = BABL.id_bloc AND BL.status = "active"
                INNER JOIN collaborateur COL ON COL.code_col = BABL.id_collaborateur
                WHERE BABL.status = "active"`;
    if (data.code_bloc != undefined) {
      req += ` AND BABL.id_bloc = "${data.code_bloc}"`;
    } else if (data.code_benef != undefined) {
      req += ` AND BABL.code_benef_bl = "${data.code_benef}"`;
    }
    return await this.db.query(req);
  }
  async generateCodeBenefBloc(data: any) {
    let req = `SELECT BABL.code_benef_bl, BNF.nom, BNF.prenom, BABL.code_benef_bl_temp, BABL.id_proj, BABL.id_activ, BABL.id_benef, BABL.id_bloc, BABL.code_achat, BABL.id_collaborateur, BABL.etat, BABL.status
              FROM benef_activ_bl BABL
              INNER JOIN beneficiaire BNF ON BNF.code_benef = BABL.id_benef`;
    if (data.code_bloc != undefined) {
      req += ` WHERE BABL.id_bloc = "${data.code_bloc}" ORDER BY BABL.code_benef_bl_temp`;
    }
    return await this.db.query(req);
  }

  async loadBlocZone(code_bloc: any) {
    const state = `SELECT BLZ.code, BLZ.id_bloc, B.nom AS nom_bloc, COM.nom_com, BLZ.id_fkt, FKT.nom_fkt,  BLZ.id_km, BENF.nom, BENF.prenom
                  FROM bloc_zone BLZ
                  INNER JOIN bloc B ON B.code_bloc = BLZ.id_bloc
                  INNER JOIN zone_fonkotany FKT ON FKT.code_fkt = BLZ.id_fkt
                  INNER JOIN zone_commune COM ON COM.code_com =  FKT.id_com
                  INNER JOIN benef_activ_bl BABL ON BABL.code_benef_bl = BLZ.id_km
                  INNER JOIN beneficiaire BENF ON BENF.code_benef = BABL.id_benef
                  WHERE BLZ.id_bloc = "${code_bloc}"
                  UNION
                  SELECT BLZ.code, BLZ.id_bloc, B.nom, COM.nom_com, BLZ.id_fkt, FKT.nom_fkt,  BLZ.id_km, '', ''
                  FROM bloc_zone BLZ
                  INNER JOIN bloc B ON B.code_bloc = BLZ.id_bloc
                  INNER JOIN zone_fonkotany FKT ON FKT.code_fkt = BLZ.id_fkt
                  INNER JOIN zone_commune COM ON COM.code_com =  FKT.id_com
                  WHERE BLZ.id_bloc = "${code_bloc}" AND BLZ.id_fkt NOT IN (
                  SELECT BLZ.id_fkt
                  FROM bloc_zone BLZ
                  INNER JOIN bloc B ON B.code_bloc = BLZ.id_bloc
                  INNER JOIN zone_fonkotany FKT ON FKT.code_fkt = BLZ.id_fkt
                  INNER JOIN zone_commune COM ON COM.code_com =  FKT.id_com
                  INNER JOIN benef_activ_bl BABL ON BABL.code_benef_bl = BLZ.id_km
                  INNER JOIN beneficiaire BENF ON BENF.code_benef = BABL.id_benef
                  WHERE BLZ.id_bloc = "${code_bloc}")`;
    return await this.db.query(state);
  }

  async loadSaison() {
    const statement = `SELECT code_saison, intitule, description FROM saison`;
    return await this.db.query(statement);
  }

  async loadCategEspece() {
    const statement = `SELECT code_cat, libelle FROM categorie_espece`;
    return await this.db.query(statement);
  }

  async loadEspece() {
    const statement = `SELECT E.code_espece, E.nom_espece, E.id_categ, CE.libelle, E.saisonnier, E.unite, E.unite_estimation, E.unite_objectif
                      FROM espece E
                      INNER JOIN categorie_espece CE ON CE.code_cat = E.id_categ`;
    return await this.db.query(statement);
  }

  async loadVariette() {
    const statement = `SELECT V.code_var, V.nom_var, V.id_espece, E.nom_espece
                      FROM variette V
                      INNER JOIN espece E ON E.code_espece = V.id_espece`;
    return await this.db.query(statement);
  }

  loadEquipe(): Observable<any[]> {
    this.dbService.dbReady.subscribe(async isReady => {
      if (isReady) {
        let equipe_: Equipe[] = [];
        const statement = `SELECT * FROM equipe;`;
  
        await this.db.query(statement).then(res => {
          if (res.values.length) {
            res.values.forEach(elem => {
              equipe_.push({
                code_equipe: elem.code_equipe, 
                img: elem.img, 
                matricule: elem.matricule,
                nom: elem.nom, 
                prenom: elem.prenom, 
                sexe: elem.sexe, 
                dt_nais: elem.dt_nais, 
                cin: elem.cin, 
                dt_delivrance: elem.dt_delivrance, 
                lieu_delivrance: elem.lieu_delivrance, 
                img_cin: elem.img_cin, 
                email: elem.email, 
                num_perso: elem.num_perso, 
                num_float: elem.num_float, 
                id_fonct: elem.id_fonct,
                intitule_fct: elem.intitule_fct,
                statuts: elem.statuts
              });
            });
            this.equipe.next(equipe_);
          } else console.log("Aucun enregistrement pour la table bloc");
        });
      }
    });
    return this.equipe.asObservable();
  }

  loadProjetEquipe(): Observable<any[]> {
    this.dbService.dbReady.subscribe(async isReady => {
      if (isReady) {
        let pr_equipe: ProjetEquipe[] = [];
        const statement = `SELECT * FROM projet_equipe;`;
  
        await this.db.query(statement).then(res => {
          if (res.values.length) {
            res.values.forEach(elem => {
              pr_equipe.push({
                code: elem.code,
                id_projet: elem.id_projet,
                id_equipe: elem.id_equipe,
                status_pe: elem.status_pe
              });
            });
            this.projetEquipe.next(pr_equipe);
          } else console.log("Aucun enregistrement pour la table ProjetEquipe");
        });
      }
    });
    return this.projetEquipe.asObservable();
  }

  loadCollabActivite(): Observable<any[]> {
    this.dbService.dbReady.subscribe(async isReady => {
      if (isReady) {
        let collAct: any[] = [];
        const statement = `SELECT CA.code, CA.id_col, C.nom as nom_col, CA.id_activ, A.intitule
                            FROM collaborateur_activ CA
                            INNER JOIN collaborateur C ON C.code_col = CA.id_col
                            INNER JOIN activite A ON A.code_act = CA.id_activ
                            ORDER BY A.code_act;`;
  
        await this.db.query(statement).then(res => {
          if (res.values.length) {
            res.values.forEach(elem => {
              collAct.push({ 
                code: elem.code, 
                id_col: elem.id_col, 
                nom_col: elem.nom_col, 
                id_activ: elem.id_activ, 
                intitule: elem.intitule
              });
            });
            this.collabActive.next(collAct);
          } else console.log("Aucun enregistrement pour la table collaborateur_activ");
        });
      }
    });
    return this.collabActive.asObservable();
  }

  async findMepParceBloc(code_parce: any) {
    const state = `SELECT code_culture, id_parce, id_espece, id_var, id_saison, id_annee, ddp, qso, dt_distribution, dds, sfce, nbre_ligne, long_ligne, usage, sc, ea_autres, ea_id_variette, dt_creation, dt_modification, status, etat, id_equipe, type 
                  FROM culture_bl WHERE id_parce = "${code_parce}"`;
    return await this.db.query(state);
  }

  async findParceBenefBloc(code_benef: string) {
    const state = `SELECT code_parce, code_parce_temp, id_bloc, id_benef, ref_gps, lat, log, superficie, id_fkt, id_commune, village, anne_adheran, indication, etat, status 
                  FROM bloc_parce WHERE id_benef = "${code_benef}"`;
    return await this.db.query(state);
  }

  /*****************************
   * Load Beneficiare Pms Par association
   ******************************/
  async loadBeneficiairePms(data: any) {
        /**
         * Séléctionner béneficiaire Association + nombre de parcelle
         */
        let statement = `SELECT BPMS.id_activ, A.intitule, BPMS.id_proj, P.nom as nom_pr, FKT_ASS.nom_fkt AS fkt_association, BPMS.id_association, ASS.nom as nom_ass, BPMS.code_benef_pms, BPMS.code_pms_temp, BPMS.code_achat, BPMS.id_benef, B.code_benef, B.img_benef, B.nom as nom_benef, B.prenom, B.sexe, B.dt_nais, B.dt_nais_vers, B.surnom, B.cin, B.dt_delivrance, B.lieu_delivrance, B.img_cin, B.contact, B.id_fkt, B.village, BPMS.id_collaborateur, C.nom as nom_collab, B.etat AS etat_benef, B.statut, BPMS.etat AS etat_pms,
                          CASE WHEN B.dt_nais IS NOT NULL THEN B.dt_nais
                          WHEN B.dt_nais_vers IS NOT NULL THEN B.dt_nais_vers ELSE NULL END AS data_naissance,
                          CASE WHEN B.id_commune IS NOT NULL AND B.id_fkt IS NULL THEN (SELECT REG.code_reg FROM zone_commune COM INNER JOIN zone_district DIST ON DIST.code_dist = COM.id_dist INNER JOIN zone_region REG ON REG.code_reg = DIST.id_reg WHERE COM.code_com = B.id_commune)
                          WHEN B.id_fkt IS NOT NULL THEN (SELECT ZREG.code_reg FROM zone_fonkotany FKT INNER JOIN zone_commune ZCOM ON ZCOM.code_com = FKT.id_com INNER JOIN zone_district ZDIST ON ZDIST.code_dist = ZCOM.id_dist INNER JOIN zone_region ZREG ON ZREG.code_reg = ZDIST.id_reg WHERE FKT.code_fkt = B.id_fkt) ELSE NULL END AS code_region,
                          CASE WHEN B.id_commune IS NOT NULL AND B.id_fkt IS NULL THEN (SELECT DIST.code_dist FROM zone_commune COM INNER JOIN zone_district DIST ON DIST.code_dist = COM.id_dist WHERE COM.code_com = B.id_commune)
                          WHEN B.id_fkt IS NOT NULL THEN (SELECT ZDIST.code_dist FROM zone_fonkotany FKT INNER JOIN zone_commune ZCOM ON ZCOM.code_com = FKT.id_com INNER JOIN zone_district ZDIST ON ZDIST.code_dist = ZCOM.id_dist WHERE FKT.code_fkt = B.id_fkt) ELSE NULL END AS code_district,
                          CASE WHEN B.id_commune IS NOT NULL AND B.id_fkt IS NULL THEN (SELECT DIST.nom_dist FROM zone_commune COM INNER JOIN zone_district DIST ON DIST.code_dist = COM.id_dist WHERE COM.code_com = B.id_commune)
                          WHEN B.id_fkt IS NOT NULL THEN (SELECT ZDIST.nom_dist FROM zone_fonkotany FKT INNER JOIN zone_commune ZCOM ON ZCOM.code_com = FKT.id_com INNER JOIN zone_district ZDIST ON ZDIST.code_dist = ZCOM.id_dist WHERE FKT.code_fkt = B.id_fkt) ELSE NULL END AS nom_district,
                          CASE WHEN B.id_commune IS NOT NULL AND B.id_fkt IS NULL THEN (SELECT COM.code_com FROM zone_commune COM WHERE COM.code_com = B.id_commune)
                          WHEN B.id_fkt IS NOT NULL THEN (SELECT ZCOM.code_com FROM zone_fonkotany FKT INNER JOIN zone_commune ZCOM ON ZCOM.code_com = FKT.id_com WHERE FKT.code_fkt = B.id_fkt) ELSE NULL END AS code_commune,
                          CASE WHEN B.id_commune IS NOT NULL AND B.id_fkt IS NULL THEN (SELECT COM.nom_com FROM zone_commune COM WHERE COM.code_com = B.id_commune)
                          WHEN B.id_fkt IS NOT NULL THEN (SELECT ZCOM.nom_com FROM zone_fonkotany FKT INNER JOIN zone_commune ZCOM ON ZCOM.code_com = FKT.id_com WHERE FKT.code_fkt = B.id_fkt) ELSE NULL END AS nom_commune,
                          CASE WHEN B.id_fkt IS NOT NULL AND B.village IS NULL THEN (SELECT FKT.nom_fkt FROM zone_fonkotany FKT WHERE FKT.code_fkt = B.id_fkt) 
                          WHEN B.village IS NOT NULL AND B.id_fkt IS NULL THEN B.village END AS adress
                          FROM benef_activ_pms BPMS 
                          INNER JOIN projet P ON P.code_proj = BPMS.id_proj AND P.statuts = "activer"
                          INNER JOIN activite A ON A.code_act = BPMS.id_activ
                          INNER JOIN beneficiaire B ON B.code_benef = BPMS.id_benef AND B.statut = "active"
                          INNER JOIN association ASS ON ASS.code_ass = BPMS.id_association AND ASS.status = "active"
                          INNER JOIN collaborateur C ON C.code_col = BPMS.id_collaborateur
                          INNER JOIN zone_fonkotany FKT_ASS ON FKT_ASS.code_fkt = ASS.id_fkt
                          WHERE BPMS.status = "active"`;
    if (!(Object.keys(data).length === 0)) {
      if (data.code_ass != undefined) {
        statement += ` AND BPMS.id_association =  "${data.code_ass}" ORDER BY ASS.nom, BPMS.code_pms_temp`;
      } else if (data.code_benef_pms != undefined) {
        statement += ` AND BPMS.code_benef_pms = "${data.code_benef_pms}" ORDER BY ASS.nom, BPMS.code_pms_temp`;
      }
    }
    return await this.db.query(statement);
  }
  async loadBeneficiairePmsSaison(data: any) {
    /**
     * Séléctionner béneficiaire Association + nombre de parcelle
     */
    let statement = `SELECT SS_PRC.id_annee, SS_PRC.id_saison, SS_PRC.id_pms, BPMS.id_activ, A.intitule, BPMS.id_proj, P.nom as nom_pr, FKT_ASS.nom_fkt AS fkt_association, BPMS.id_association, ASS.nom as nom_ass, BPMS.code_benef_pms, BPMS.code_achat, BPMS.id_benef, B.code_benef, B.img_benef, B.nom as nom_benef, B.prenom, B.sexe, B.dt_nais, B.dt_nais_vers, B.surnom, B.cin, B.dt_delivrance, B.lieu_delivrance, B.img_cin, B.contact, B.id_fkt, B.village, BPMS.id_collaborateur, C.nom as nom_collab, B.etat AS etat_benef, B.statut, BPMS.etat AS etat_pms,
                  CASE WHEN B.id_commune IS NOT NULL AND B.id_fkt IS NULL THEN (SELECT REG.code_reg FROM zone_commune COM INNER JOIN zone_district DIST ON DIST.code_dist = COM.id_dist INNER JOIN zone_region REG ON REG.code_reg = DIST.id_reg WHERE COM.code_com = B.id_commune)
                  WHEN B.id_fkt IS NOT NULL THEN (SELECT ZREG.code_reg FROM zone_fonkotany FKT INNER JOIN zone_commune ZCOM ON ZCOM.code_com = FKT.id_com INNER JOIN zone_district ZDIST ON ZDIST.code_dist = ZCOM.id_dist INNER JOIN zone_region ZREG ON ZREG.code_reg = ZDIST.id_reg WHERE FKT.code_fkt = B.id_fkt) ELSE NULL END AS code_region,
                  CASE WHEN B.id_commune IS NOT NULL AND B.id_fkt IS NULL THEN (SELECT DIST.code_dist FROM zone_commune COM INNER JOIN zone_district DIST ON DIST.code_dist = COM.id_dist WHERE COM.code_com = B.id_commune)
                  WHEN B.id_fkt IS NOT NULL THEN (SELECT ZDIST.code_dist FROM zone_fonkotany FKT INNER JOIN zone_commune ZCOM ON ZCOM.code_com = FKT.id_com INNER JOIN zone_district ZDIST ON ZDIST.code_dist = ZCOM.id_dist WHERE FKT.code_fkt = B.id_fkt) ELSE NULL END AS code_district,
                  CASE WHEN B.id_commune IS NOT NULL AND B.id_fkt IS NULL THEN (SELECT DIST.nom_dist FROM zone_commune COM INNER JOIN zone_district DIST ON DIST.code_dist = COM.id_dist WHERE COM.code_com = B.id_commune)
                  WHEN B.id_fkt IS NOT NULL THEN (SELECT ZDIST.nom_dist FROM zone_fonkotany FKT INNER JOIN zone_commune ZCOM ON ZCOM.code_com = FKT.id_com INNER JOIN zone_district ZDIST ON ZDIST.code_dist = ZCOM.id_dist WHERE FKT.code_fkt = B.id_fkt) ELSE NULL END AS nom_district,
                  CASE WHEN B.id_commune IS NOT NULL AND B.id_fkt IS NULL THEN (SELECT COM.code_com FROM zone_commune COM WHERE COM.code_com = B.id_commune)
                  WHEN B.id_fkt IS NOT NULL THEN (SELECT ZCOM.code_com FROM zone_fonkotany FKT INNER JOIN zone_commune ZCOM ON ZCOM.code_com = FKT.id_com WHERE FKT.code_fkt = B.id_fkt) ELSE NULL END AS code_commune,
                  CASE WHEN B.id_commune IS NOT NULL AND B.id_fkt IS NULL THEN (SELECT COM.nom_com FROM zone_commune COM WHERE COM.code_com = B.id_commune)
                  WHEN B.id_fkt IS NOT NULL THEN (SELECT ZCOM.nom_com FROM zone_fonkotany FKT INNER JOIN zone_commune ZCOM ON ZCOM.code_com = FKT.id_com WHERE FKT.code_fkt = B.id_fkt) ELSE NULL END AS nom_commune,
                  CASE WHEN B.id_fkt IS NOT NULL AND B.village IS NULL THEN (SELECT FKT.nom_fkt FROM zone_fonkotany FKT WHERE FKT.code_fkt = B.id_fkt) 
                  WHEN B.village IS NOT NULL AND B.id_fkt IS NULL THEN B.village END AS adress
                  FROM benef_activ_pms BPMS 
                  INNER JOIN projet P ON P.code_proj = BPMS.id_proj AND P.statuts = "activer"
                  INNER JOIN activite A ON A.code_act = BPMS.id_activ
                  INNER JOIN beneficiaire B ON B.code_benef = BPMS.id_benef AND B.statut = "active"
                  INNER JOIN association ASS ON ASS.code_ass = BPMS.id_association AND ASS.status = "active"
                  INNER JOIN collaborateur C ON C.code_col = BPMS.id_collaborateur
                  INNER JOIN zone_fonkotany FKT_ASS ON FKT_ASS.code_fkt = ASS.id_fkt
                  INNER JOIN assoc_parce_saison SS_PRC ON SS_PRC.id_pms = BPMS.code_benef_pms
                  WHERE BPMS.status = "active"`;
    if (!(Object.keys(data).length === 0)) {
      if (data.code_ass != undefined) {
        statement += ` AND BPMS.id_association =  "${data.code_ass}"`;
      } else if (data.code_benef_pms != undefined) {
        statement += ` AND BPMS.code_benef_pms = "${data.code_benef_pms}"`;
      }
    }
    return await this.db.query(statement);
  }
  async loadCodePms(code_assoc: any) {
    let statement = `SELECT BPMS.code_benef_pms, BPMS.code_pms_temp, BPMS.code_achat, BPMS.id_proj, BPMS.id_benef, BPMS.id_activ, BPMS.id_association, BPMS.status, BPMS.etat
                    FROM benef_activ_pms BPMS 
                    WHERE BPMS.id_association = "${code_assoc}"
                    ORDER BY BPMS.code_pms_temp`;
    return await this.db.query(statement);
  }

  /****************************************
 * Load Culture ENCOURS beneficiare PMS
 ***************************************/
  async loadCulturesPms(data: any) { 
    let state = `SELECT CLT.code_culture, CLT.id_contrat, CTR.code_contrat AS code_contrat_temp, CLT.id_parce, AS_PRC.superficie, BPMS.code_benef_pms, BPMS.code_pms_temp, BPMS.code_achat, B.nom, B.prenom, B.sexe, B.dt_nais, B.dt_nais_vers, B.cin, ESP.code_espece, ESP.nom_espece, CLT.id_var, VAR.nom_var, ESP.unite AS unite_espece, ESP.unite_estimation, ESP.unite_objectif, CLT.id_saison, S.intitule as saison, ASS.code_ass, ASS.nom AS association, CLT.id_annee, AN_G.annee_du, AN_G.annee_au, CLT.ddp, CLT.qsa, CLT.img_fact, CLT.dds, CLT.sfce, CLT.sc, CLT.nb_ligne, CLT.long_ligne, CLT.ea_id_variette, CLT.ea_autres, CASE 
                WHEN CLT.ea_id_variette IS NOT NULL THEN (SELECT (ESP.nom_espece || ' ' || V.nom_var) AS variete FROM variette V INNER JOIN espece ESP ON ESP.code_espece = V.id_espece WHERE V.code_var = CLT.ea_id_variette)
                WHEN CLT.ea_autres IS NOT NULL THEN CLT.ea_autres ELSE '' END AS ea, 
                CASE WHEN CLT.ea_id_variette IS NOT NULL THEN (SELECT V.id_espece FROM variette V WHERE V.code_var = CLT.ea_id_variette) ELSE '' END AS ea_id_espece,
                CLT.dt_creation, CLT.dt_modification, CLT.statuts, CLT.Etat AS etat_mep, AS_PRC.code_parce_temp,
                CASE WHEN B.dt_nais IS NOT NULL THEN B.dt_nais
                WHEN B.dt_nais_vers IS NOT NULL THEN B.dt_nais_vers END AS date_naissance
                FROM cultures_pms CLT
                INNER JOIN saison S ON S.code_saison = CLT.id_saison
                INNER JOIN annee_agricole AN_G ON AN_G.code = CLT.id_annee
                INNER JOIN assoc_parce AS_PRC ON AS_PRC.code_parce = CLT.id_parce
                INNER JOIN association ASS ON ASS.code_ass = AS_PRC.id_assoc
                INNER JOIN benef_activ_pms BPMS ON BPMS.id_benef = AS_PRC.id_benef
                INNER JOIN beneficiaire B ON B.code_benef = BPMS.id_benef
                INNER JOIN variette VAR ON VAR.code_var = CLT.id_var
                INNER JOIN espece ESP ON ESP.code_espece = VAR.id_espece
                INNER JOIN assoc_parce_saison CTR ON CTR.code = CLT.id_contrat`;
    if (!(Object.keys(data).length === 0)) {
      if (data.code_ass != undefined) {
        if (data.annee_du != undefined) {
          state += ` WHERE B.statut = "active" AND BPMS.status = "active" AND AS_PRC.status = "active" AND CLT.statuts = "EC" AND ASS.code_ass = "${data.code_ass}" AND CLT.id_annee = ${data.id_annee} ORDER BY ASS.nom, CLT.code_culture`;
        } else {
          state += ` WHERE B.statut = "active" AND BPMS.status = "active" AND AS_PRC.status = "active" AND CLT.statuts = "EC" AND ASS.code_ass = "${data.code_ass}"
                  ORDER BY ASS.nom, CLT.code_culture`;
        }
      } else if (data.code_cult != undefined) {
        state += ` WHERE B.statut = "active" AND BPMS.status = "active" AND AS_PRC.status = "active" AND CLT.statuts = "EC" AND CLT.code_culture = "${data.code_cult}"`;
      }
    }
    return await this.db.query(state);
  }

  /**********************************************
  * LOAD SUIVI CULTURE
  ***********************************************/
  async loadSuiviCulture(code_culture: string) {
   const state = `SELECT id, id_culture, ddp, stc, ec, pb, ex, img_cult, name, path, controle, declaration FROM suivi_pms 
                  WHERE id_culture = '${code_culture}'`;
   return await this.db.query(state);
  }
  async loadAllSuiviCulture(code_ass: string) {
    const state = `SELECT SPMS.id, SPMS.id_culture, ASS.code_ass, ASS.nom AS association, 
    BPMS.code_benef_pms AS code_pms, BPMS.code_pms_temp, BPMS.code_achat, BNF.nom, BNF.prenom, BNF.sexe, BNF.dt_nais, BNF.dt_nais_vers, BNF.cin, CTR.code_contrat, CPMS.id_parce, ASS_PRC.code_parce_temp, ASS_PRC.superficie AS superficie_reel, 
    CPMS.id_var, ESP.nom_espece, ESP.unite, ESP.unite_estimation, VAR.nom_var, CPMS.id_saison, SS.intitule AS saison, 
    SS.description AS desc_saison, CPMS.id_annee, AN_G.annee_du, AN_G.annee_au, CPMS.qsa, CPMS.dds, CPMS.sfce, CPMS.sc, SPMS.ddp, 
    SPMS.stc, SPMS.ec, SPMS.pb, SPMS.ex, SPMS.img_cult, SPMS.name, SPMS.controle, SPMS.declaration, SPMS.etat AS etat_suivi
    FROM suivi_pms SPMS
    INNER JOIN cultures_pms CPMS ON CPMS.code_culture = SPMS.id_culture
    INNER JOIN saison SS ON SS.code_saison = CPMS.id_saison
    INNER JOIN annee_agricole AN_G ON AN_G.code = CPMS.id_annee
    INNER JOIN variette VAR ON VAR.code_var = CPMS.id_var
    INNER JOIN espece ESP ON ESP.code_espece = VAR.id_espece
    INNER JOIN assoc_parce ASS_PRC ON ASS_PRC.code_parce = CPMS.id_parce
    INNER JOIN Beneficiaire BNF ON BNF.code_benef = ASS_PRC.id_benef
    INNER JOIN benef_activ_pms BPMS ON BPMS.id_benef = BNF.code_benef
    INNER JOIN association ASS ON ASS.code_ass = ASS_PRC.id_assoc
    INNER JOIN assoc_parce_saison CTR ON CTR.code = CPMS.id_contrat
    WHERE ASS_PRC.status = "active" AND BPMS.status = "active" AND ASS.code_ass = "${code_ass}";`; 
    // ESP.nom_espece || " " || VAR.nom_var as 
    // CPMS.statuts = "EC" AND 
    return await this.db.query(state);
  }
  async findContratPMS(code_pms: string) {
    const state = `SELECT code AS code_contrat, code_contrat AS code_contrat_temp, id_annee, id_saison, id_pms, id_parce, ref_gps, lat, log, id_var, objectif, etat, commentaire 
                FROM assoc_parce_saison WHERE id_pms = "${code_pms}"`;
   return await this.db.query(state);
  }
  async findMEPContrat(code_contrat: string) {
    const state = `SELECT code_culture, id_contrat, id_parce, id_var, id_saison, id_annee, ddp, qsa, img_fact, dds, sfce, sc, ea_id_variette, ea_autres, dt_creation, dt_modification, statuts, Etat 
                FROM cultures_pms WHERE id_contrat = "${code_contrat}"`;
   return await this.db.query(state);
  }
  async findSuiviMEPContrat(code_mep: string) {
    const state = `SELECT id AS code_suivi, id_culture, ddp, stc, ec, pb, ex, img_cult, name, controle, declaration, etat 
                  FROM suivi_pms WHERE id_culture = "${code_mep}"`;
    return await this.db.query(state);
  }

  loadBeneficiaireBloc(): Observable<any[]> {
    this.dbService.dbReady.subscribe(async isReady => {
      if (isReady) {
        let beneficiaire: any[] = [];
        const statement = `SELECT BBL.code_benef_bl, BBL.id_proj, P.nom as nom_pr,  BBL.id_activ, A.intitule,  BBL.id_benef, BBL.id_bloc, BL.nom as nom_bl,
                            B.code_benef, B.img_benef, B.nom as nom_benef, B.prenom, B.sexe, B.dt_nais, B.surnom, B.cin, B.dt_delivrance, B.lieu_delivrance,
                            B.img_cin, B.contact, B.id_fkt, FKT.nom_fkt, BBL.id_collaborateur, C.nom as nom_collab, B.statut
                            FROM benef_activ_bl BBL 
                            INNER JOIN projet P ON P.code_proj = BBL.id_proj
                            INNER JOIN activite A ON A.code_act = BBL.id_activ
                            INNER JOIN beneficiaire B ON B.code_benef = BBL.id_benef
                            INNER JOIN bloc BL ON BL.code_bloc = BBL.id_bloc
                            INNER JOIN collaborateur C ON C.code_col = BBL.id_collaborateur
                            INNER JOIN zone_fonkotany FKT ON FKT.code_fkt = B.id_fkt
                            ORDER BY P.nom, BL.nom, BBL.code_benef_bl, B.nom;`;
  
        await this.db.query(statement).then(res => {
          if (res.values.length) {
            res.values.forEach(elem => {
              beneficiaire.push({ 
                code_benef_bl: elem.code_benef_bl, 
                id_proj: elem.id_proj, 
                nom_pr: elem.nom_pr,
                id_activ: elem.id_activ,
                intitule: elem.intitule,
                id_benef: elem.id_benef,
                id_bloc: elem.id_bloc,
                nom_bl: elem.nom_bl,
                code_benef: elem.code_benef,
                img_benef: elem.img_benef,
                nom_benef: elem.nom_benef,
                prenom: elem.prenom,
                sexe: elem.sexe,
                dt_nais: elem.dt_nais,
                surnom: elem.surnom,
                cin: elem.cin,
                dt_delivrance: elem.dt_delivrance,
                lieu_delivrance: elem.lieu_delivrance,
                img_cin: elem.img_cin,
                contact: elem.contact,
                id_fkt: elem.id_fkt,
                nom_fkt: elem.nom_fkt,
                statut: elem.statut,
                nom_collab: elem.nom_collab,
                id_collaborateur: elem.id_collaborateur
              });
            });
            this.beneficiaire_bloc.next(beneficiaire);
          } else console.log("Aucun enregistrement pour la table beneficiaire");
        });
      }
    });
    return this.beneficiaire_bloc.asObservable();
  }

  async loadBlocParce(data: any) {
    let state = `SELECT BPARC.code_parce, BPARC.code_parce_temp, BPARC.id_bloc, BL.nom AS nom_bloc, BABL.code_benef_bl, BENF.nom, BENF.prenom,  BPARC.ref_gps, BPARC.lat, BPARC.log, BPARC.superficie, BPARC.anne_adheran, BPARC.status, BPARC.id_fkt, BPARC.id_commune, BPARC.village, BPARC.indication, BPARC.etat,
              CASE WHEN BPARC.id_fkt IS NOT NULL THEN (SELECT DIST.id_reg FROM zone_fonkotany FKT INNER JOIN zone_commune COM ON COM.code_com = FKT.id_com INNER JOIN zone_district DIST ON DIST.code_dist = COM.id_dist WHERE FKT.code_fkt = BPARC.id_fkt)
              WHEN BPARC.id_commune IS NOT NULL AND BPARC.village IS NOT NULL THEN (SELECT ZD.id_reg FROM zone_commune ZC INNER JOIN zone_district ZD ON ZD.code_dist = ZC.id_dist WHERE ZC.code_com = BPARC.id_commune) ELSE NULL END AS code_reg,
              CASE WHEN BPARC.id_fkt IS NOT NULL THEN (SELECT DIST.code_dist FROM zone_fonkotany FKT INNER JOIN zone_commune COM ON COM.code_com = FKT.id_com INNER JOIN zone_district DIST ON DIST.code_dist = COM.id_dist WHERE FKT.code_fkt = BPARC.id_fkt)
              WHEN BPARC.id_commune IS NOT NULL AND BPARC.village IS NOT NULL THEN (SELECT ZD.code_dist FROM zone_commune ZC INNER JOIN zone_district ZD ON ZD.code_dist = ZC.id_dist WHERE ZC.code_com = BPARC.id_commune) ELSE NULL END AS code_dist,
              CASE WHEN BPARC.id_fkt IS NOT NULL THEN (SELECT DIST.nom_dist FROM zone_fonkotany FKT INNER JOIN zone_commune COM ON COM.code_com = FKT.id_com INNER JOIN zone_district DIST ON DIST.code_dist = COM.id_dist WHERE FKT.code_fkt = BPARC.id_fkt)
              WHEN BPARC.id_commune IS NOT NULL AND BPARC.village IS NOT NULL THEN (SELECT ZD.nom_dist FROM zone_commune ZC INNER JOIN zone_district ZD ON ZD.code_dist = ZC.id_dist WHERE ZC.code_com = BPARC.id_commune) ELSE NULL END AS district,
              CASE WHEN BPARC.id_fkt IS NOT NULL THEN (SELECT COM.code_com FROM zone_fonkotany FKT INNER JOIN zone_commune COM ON COM.code_com = FKT.id_com WHERE FKT.code_fkt = BPARC.id_fkt)
              WHEN BPARC.id_commune IS NOT NULL AND BPARC.village IS NOT NULL THEN (SELECT ZC.code_com FROM zone_commune ZC WHERE ZC.code_com = BPARC.id_commune) ELSE NULL END AS code_commune,
              CASE WHEN BPARC.id_fkt IS NOT NULL THEN (SELECT COM.nom_com FROM zone_fonkotany FKT INNER JOIN zone_commune COM ON COM.code_com = FKT.id_com WHERE FKT.code_fkt = BPARC.id_fkt)
              WHEN BPARC.id_commune IS NOT NULL AND BPARC.village IS NOT NULL THEN (SELECT ZC.nom_com FROM zone_commune ZC WHERE ZC.code_com = BPARC.id_commune) ELSE NULL END AS commune,
              CASE WHEN BPARC.id_fkt IS NOT NULL THEN (SELECT fkt.nom_fkt FROM zone_fonkotany FKT WHERE FKT.code_fkt = BPARC.id_fkt)
              WHEN BPARC.id_commune IS NOT NULL AND BPARC.village IS NOT NULL THEN BPARC.village ELSE NULL END AS fokontany
              FROM bloc_parce BPARC 
              INNER JOIN bloc BL ON BL.code_bloc = BPARC.id_bloc
              INNER JOIN beneficiaire BENF ON BENF.code_benef = BPARC.id_benef AND BENF.statut = "active"
              INNER JOIN benef_activ_bl BABL ON (BABL.id_benef = BPARC.id_benef AND BABL.id_bloc = BPARC.id_bloc) AND BABL.status = "active"`;
    if (!(Object.keys(data).length === 0)) {
      if (data.code_bloc != undefined) {
        state += ` WHERE BPARC.status = "active" AND BL.code_bloc = "${data.code_bloc}"`;
      } else if(data.code_benef_bl != undefined) {
        state += ` WHERE BPARC.status = "active" AND BABL.code_benef_bl = "${data.code_benef_bl}"`;
      }
    }
    return await this.db.query(state);
  }

  async loadBlocParceAll(data: any) {
    const state = `SELECT BPRC.code_parce, BPRC.code_parce_temp, BPRC.id_bloc, BPRC.id_benef, BPRC.ref_gps, BPRC.lat, BPRC.log, BPRC.superficie, BPRC.id_fkt, BPRC.id_commune, BPRC.village, BPRC.anne_adheran, BPRC.indication, BPRC.etat, BPRC.status, BL.nom AS bloc, BBL.code_benef_bl, BBL.code_benef_bl_temp, BNF.img_benef, BNF.nom, BNF.prenom, BNF.sexe, BNF.cin, BNF.dt_nais, BNF.dt_nais_vers, BNF.surnom,
                  CASE WHEN BPRC.id_fkt IS NOT NULL THEN (SELECT REG.code_reg FROM zone_fonkotany FKT INNER JOIN zone_commune COM ON COM.code_com = FKT.id_com INNER JOIN zone_district DIST ON DIST.code_dist = COM.id_dist INNER JOIN zone_region REG ON REG.code_reg = DIST.id_reg WHERE FKT.code_fkt = BPRC.id_fkt)
                  WHEN BPRC.village IS NOT NULL AND BPRC.id_fkt IS NULL THEN (SELECT VREG.code_reg FROM zone_commune VCOM INNER JOIN zone_district VDIST ON VDIST.code_dist = VCOM.id_dist INNER JOIN zone_region VREG ON VREG.code_reg = VDIST.id_reg WHERE VCOM.code_com = BPRC.id_commune) END AS code_region_parce,
                  CASE WHEN BPRC.id_fkt IS NOT NULL THEN (SELECT DIST.code_dist FROM zone_fonkotany FKT INNER JOIN zone_commune COM ON COM.code_com = FKT.id_com INNER JOIN zone_district DIST ON DIST.code_dist = COM.id_dist WHERE FKT.code_fkt = BPRC.id_fkt)
                  WHEN BPRC.village IS NOT NULL AND BPRC.id_fkt IS NULL THEN (SELECT VDIST.code_dist FROM zone_commune VCOM INNER JOIN zone_district VDIST ON VDIST.code_dist = VCOM.id_dist WHERE VCOM.code_com = BPRC.id_commune) END AS code_district_parce,
                  CASE WHEN BPRC.id_fkt IS NOT NULL THEN (SELECT COM.code_com FROM zone_fonkotany FKT INNER JOIN zone_commune COM ON COM.code_com = FKT.id_com WHERE FKT.code_fkt = BPRC.id_fkt)
                  WHEN BPRC.village IS NOT NULL AND BPRC.id_fkt IS NULL THEN (SELECT VCOM.code_com FROM zone_commune VCOM WHERE VCOM.code_com = BPRC.id_commune) END AS code_commune_parce,
                  CASE WHEN BPRC.id_fkt IS NOT NULL THEN (SELECT COM.nom_com FROM zone_fonkotany FKT INNER JOIN zone_commune COM ON COM.code_com = FKT.id_com WHERE FKT.code_fkt = BPRC.id_fkt)
                  WHEN BPRC.village IS NOT NULL AND BPRC.id_fkt IS NULL THEN (SELECT VCOM.nom_com FROM zone_commune VCOM WHERE VCOM.code_com = BPRC.id_commune) END AS commune_parce,
                  CASE WHEN BPRC.id_fkt IS NOT NULL THEN (SELECT FKT.nom_fkt FROM zone_fonkotany FKT WHERE FKT.code_fkt = BPRC.id_fkt)
                  WHEN BPRC.village IS NOT NULL AND BPRC.id_fkt IS NULL THEN BPRC.village END AS fokontany_parce,
                  CASE WHEN BNF.dt_nais IS NOT NULL THEN BNF.dt_nais
                  WHEN BNF.dt_nais_vers IS NOT NULL THEN BNF.dt_nais_vers END AS date_naissance,
                  CASE WHEN BNF.id_fkt IS NOT NULL THEN (SELECT COM.nom_com FROM zone_fonkotany FKT INNER JOIN zone_commune COM ON COM.code_com = FKT.id_com WHERE FKT.code_fkt = BNF.id_fkt)
                  WHEN BNF.village IS NOT NULL AND BNF.id_fkt IS NULL THEN (SELECT VCOM.nom_com FROM zone_commune VCOM WHERE VCOM.code_com = BNF.id_commune) END AS commune_benef,
                  CASE WHEN BNF.id_fkt IS NOT NULL THEN (SELECT FKT.nom_fkt FROM zone_fonkotany FKT WHERE FKT.code_fkt = BNF.id_fkt)
                  WHEN BNF.village IS NOT NULL AND BNF.id_fkt IS NULL THEN BNF.village END AS fokontany_benef
                  FROM bloc_parce BPRC
                  INNER JOIN bloc BL ON BL.code_bloc = BPRC.id_bloc
                  INNER JOIN beneficiaire BNF ON BNF.code_benef = BPRC.id_benef
                  INNER JOIN benef_activ_bl BBL ON BBL.id_benef = BNF.code_benef AND BBL.id_bloc = BL.code_bloc 
                  WHERE BPRC.status = "active" AND BPRC.id_bloc = "${data.code_bloc}" ORDER BY BPRC.code_parce_temp`;
    return await this.db.query(state);
  }

  async loadMepBloc(data: any) {
    const state = `SELECT CBL.code_culture, CBL.code_culture_temp, BL.code_bloc, BL.nom AS nom_bl, BBL.code_benef_bl, BBL.code_benef_bl_temp, BNF.nom, BNF.prenom, BNF.sexe, BNF.dt_nais, BNF.dt_nais_vers, BNF.cin, BNF.dt_delivrance, BNF.lieu_delivrance, CBL.id_parce, BPRC.code_parce_temp, BPRC.superficie AS sfce_reel, BPRC.ref_gps, BPRC.lat, BPRC.log, CBL.id_espece, CBL.id_var, CBL.id_saison, CBL.id_annee, AN.annee_du, AN.annee_au, CBL.ddp, CBL.qso, CBL.dt_distribution, CBL.dds, CBL.sfce, CBL.nbre_ligne, CBL.long_ligne, CBL.usage, CBL.sc, CBL.ea_autres, CBL.ea_id_variette, CBL.dt_creation, CBL.dt_modification, CBL.status, CBL.etat AS etat_mep, CBL.id_equipe, CBL.type, 
                  CASE WHEN CBL.id_var IS NOT NULL THEN (SELECT E.code_espece FROM variette V INNER JOIN espece E ON E.code_espece = V.id_espece WHERE V.code_var = CBL.id_var)
                  ELSE '' END AS code_espece,
                  CASE WHEN CBL.id_var IS NOT NULL THEN (SELECT (E.nom_espece || ' ' || V.nom_var) AS nom_var FROM variette V INNER JOIN espece E ON E.code_espece = V.id_espece WHERE V.code_var = CBL.id_var)
                  ELSE '' END AS nom_var,
                  CASE WHEN CBL.id_var IS NOT NULL THEN (SELECT E.unite FROM variette V INNER JOIN espece E ON E.code_espece = V.id_espece WHERE V.code_var = CBL.id_var)
                  WHEN CBL.id_espece IS NOT NULL THEN (SELECT E.unite FROM espece E WHERE E.code_espece = CBL.id_espece) END AS unite_espece,
                  CASE WHEN CBL.id_var IS NOT NULL THEN (SELECT E.unite_estimation FROM variette V INNER JOIN espece E ON E.code_espece = V.id_espece WHERE V.code_var = CBL.id_var)
                  WHEN CBL.id_espece IS NOT NULL THEN (SELECT E.unite_estimation FROM espece E WHERE E.code_espece = CBL.id_espece) END AS unite_estimation,
                  CASE WHEN CBL.ea_id_variette IS NOT NULL THEN (SELECT E.code_espece FROM variette V INNER JOIN espece E ON E.code_espece = V.id_espece WHERE V.code_var = CBL.ea_id_variette)
                  ELSE '' END AS code_espece_ea,
                  CASE WHEN CBL.id_espece IS NOT NULL THEN (SELECT nom_espece FROM espece WHERE code_espece = CBL.id_espece) ELSE '' END AS nom_espece, CASE 
                  WHEN CBL.ea_id_variette IS NOT NULL THEN (SELECT (E.nom_espece || ' ' || V.nom_var) AS nom_var FROM variette V INNER JOIN espece E ON E.code_espece = V.id_espece WHERE V.code_var = CBL.ea_id_variette)
                  WHEN CBL.ea_autres IS NOT NULL THEN CBL.ea_autres 
                  ELSE '' END AS ea,
                  CASE WHEN CBL.id_saison IS NOT NULL THEN (SELECT intitule FROM saison WHERE code_saison = CBL.id_saison) 
                  ELSE NULL END AS intitule
                  FROM culture_bl CBL
                  INNER JOIN bloc_parce BPRC ON BPRC.code_parce = CBL.id_parce
                  INNER JOIN benef_activ_bl BBL ON BBL.id_benef = BPRC.id_benef 
                  INNER JOIN beneficiaire BNF ON BNF.code_benef = BPRC.id_benef
                  INNER JOIN bloc BL ON BL.code_bloc = BBL.id_bloc
                  INNER JOIN annee_agricole AN ON AN.code = CBL.id_annee
                  WHERE BPRC.status = "active" AND BBL.status = "active" AND BNF.statut = "active" `;
    if (data.type != undefined && data.id_bloc != undefined && data.id_saison != undefined && data.annee_du != undefined) {
      // Mep saisonnier
      let req = state + `AND CBL.type = "${data.type}" AND BL.code_bloc  = "${data.id_bloc}" AND CBL.id_saison = "${data.id_saison}" AND CBL.id_annee = ${data.annee_du} ORDER BY BL.code_bloc, CBL.id_annee, CBL.code_culture_temp;`;
      return await this.db.query(req);
    } else if(data.type != undefined && data.id_bloc != undefined && data.annee_du != undefined) {
      // Mep PA et MV Culture non saisoniale
      let req = state + `AND CBL.type = "${data.type}" AND BL.code_bloc  = "${data.id_bloc}" AND CBL.id_annee = ${data.annee_du} AND CBL.id_saison IS NULL ORDER BY BL.code_bloc, CBL.id_annee, CBL.code_culture_temp;`;
      return await this.db.query(req);
    } else {
      let req = state + `AND BL.code_bloc  = "${data.id_bloc}" ORDER BY BL.code_bloc, CBL.id_annee, CBL.code_culture_temp;`;
      return await this.db.query(req);
    }
  }
  /**
   * Load Single Suivi Mep Bloc
   */
  async loadSuiviBloc(code_mep: string) {
    const req = `SELECT SVBL.code_sv, SVBL.id_culture, SVBL.ddp, SVBL.stc, SVBL.ec, SVBL.ql, SVBL.qr, SVBL.long_ligne, SVBL.nbre_ligne, SVBL.nbre_pied, SVBL.hauteur, SVBL.img_cult, SVBL.dt_capture, SVBL.ex, SVBL.etat 
                FROM suivi_bl SVBL
                INNER JOIN culture_bl CBL ON CBL.code_culture = SVBL.id_culture
                WHERE SVBL.id_culture = "${code_mep}"`;
    return await this.db.query(req);
  }
  /**
   * Load All Suivi Mep Bloc
   */
  async loadAllSuiviBloc(data: any) {
    let req = `SELECT SBL.code_sv, BL.nom AS bloc, BABL.code_benef_bl, BABL.code_benef_bl_temp, BNF.nom, BNF.prenom, BNF.sexe, BNF.dt_nais, BNF.dt_nais_vers, BNF.cin, SBL.id_culture, CBL.code_culture_temp, CBL.id_parce, BPRC.superficie AS sfce_reel, BPRC.code_parce_temp, CBL.id_espece, CBL.id_var, CBL.id_saison, CBL.id_annee, AN.annee_du, AN.annee_au, CBL.qso, CBL.dds, CBL.sfce, CBL.sc AS mep_sc, CBL.ea_autres, CBL.ea_id_variette, SBL.ddp, SBL.stc, SBL.ec, SBL.ql, SBL.qr, SBL.long_ligne, SBL.nbre_ligne, SBL.nbre_pied, SBL.hauteur, SBL.img_cult, SBL.ex, SBL.etat AS etat_suivi, CBL.type,
                CASE WHEN CBL.id_espece IS NOT NULL THEN (SELECT nom_espece FROM espece WHERE code_espece = CBL.id_espece)
                ELSE NULL END AS espece,
                CASE WHEN CBL.id_var IS NOT NULL THEN (SELECT E.nom_espece || ' ' || V.nom_var AS nom_var FROM variette V INNER JOIN espece E ON E.code_espece = V.id_espece WHERE code_var = CBL.id_var)
                ELSE NULL END AS variette,
                CASE WHEN CBL.id_espece IS NOT NULL THEN (SELECT E.unite FROM espece E WHERE E.code_espece = CBL.id_espece)
                WHEN CBL.id_var IS NOT NULL THEN (SELECT E.unite FROM variette V INNER JOIN espece E ON E.code_espece = V.id_espece WHERE code_var = CBL.id_var) END AS unite_espece,
                CASE WHEN CBL.id_var IS NOT NULL THEN (SELECT E.unite_estimation FROM variette V INNER JOIN espece E ON E.code_espece = V.id_espece WHERE code_var = CBL.id_var)
                WHEN CBL.id_espece IS NOT NULL THEN (SELECT E.unite_estimation FROM espece E WHERE E.code_espece = CBL.id_espece) END AS unite_estimation,
                CASE WHEN CBL.id_saison IS NOT NULL THEN (SELECT intitule FROM saison WHERE code_saison = CBL.id_saison)
                ELSE NULL END AS saison
                FROM suivi_bl SBL
                INNER JOIN culture_bl CBL ON CBL.code_culture = SBL.id_culture
                INNER JOIN bloc_parce BPRC ON BPRC.code_parce = CBL.id_parce AND BPRC.status = "active"
                INNER JOIN bloc BL ON BL.code_bloc = BPRC.id_bloc AND BL.status = "active"
                INNER JOIN projet PRJ ON PRJ.code_proj = BL.id_prjt AND PRJ.statuts = "activer"
                INNER JOIN beneficiaire BNF ON BNF.code_benef = BPRC.id_benef AND BNF.statut = "active"
                INNER JOIN benef_activ_bl BABL ON BABL.id_benef = BNF.code_benef AND BABL.id_proj = PRJ.code_proj AND BABL.status = "active"
                INNER JOIN annee_agricole AN ON AN.code = CBL.id_annee`;
    if (data.id_bloc != undefined) {
      req += ` WHERE BL.code_bloc = "${data.id_bloc}"`;
    } else if (data.code_culture != undefined) {
      req += ` WHERE CBL.code_culture = "${data.code_culture}"`;
    } else if (data.code_suivi != undefined) {
      req += ` WHERE SBL.code_sv = "${data.code_suivi}"`;
    }
    return await this.db.query(req);
  }
  // Find Suivi Bloc
  async findSuiviMepBloc(code_mep: string) {
    const state = `SELECT code_sv, id_culture, ddp, stc, ql, qr, long_ligne, nbre_ligne, nbre_pied, hauteur, ec, img_cult, dt_capture, ex, dt_creation, dt_modification, etat 
                  FROM suivi_bl WHERE id_culture = "${code_mep}"`;
    return await this.db.query(state);
  }
  /******************************************************
   * Paysant Realais
   *******************************************************/
  async loadPRBloc(data: any) {
    const req = `SELECT BNF.img_benef, BNF.nom, BNF.prenom, BNF.sexe, BNF.dt_nais, BNF.dt_nais_vers, BNF.surnom, BNF.cin, BNF.dt_delivrance, BNF.lieu_delivrance, BNF.img_cin, BNF.contact, BNF.id_fkt, BNF.village, BAPR.code_pr, BAPR.code_pr_temp, BAPR.id_proj, BAPR.id_activ, BAPR.id_benef, BAPR.id_bloc, BAPR.code_achat, BAPR.id_collaborateur, BAPR.id_tech, BAPR.etat AS etat_pr, BAPR.status, 
              CASE WHEN BAPR.id_bloc IS NOT NULL THEN (SELECT BL.nom FROM bloc BL WHERE BL.code_bloc = BAPR.id_bloc)
              ELSE NULL END AS bloc,
              CASE WHEN BNF.id_fkt IS NOT NULL THEN (SELECT R.code_reg FROM zone_commune C INNER JOIN zone_fonkotany FKT ON FKT.id_com = C.code_com INNER JOIN zone_district D ON D.code_dist = C.id_dist INNER JOIN zone_region R ON R.code_reg = D.id_reg WHERE FKT.code_fkt = BNF.id_fkt)
              WHEN BNF.id_fkt IS NULL AND BNF.id_commune IS NOT NULL THEN (SELECT R.code_reg FROM zone_district D INNER JOIN zone_commune C ON C.id_dist = D.code_dist INNER JOIN zone_region R ON R.code_reg = D.id_reg WHERE C.code_com = BNF.id_commune)
              ELSE NULL END AS code_region,
              CASE WHEN BNF.id_fkt IS NOT NULL THEN (SELECT R.nom_reg FROM zone_commune C INNER JOIN zone_fonkotany FKT ON FKT.id_com = C.code_com INNER JOIN zone_district D ON D.code_dist = C.id_dist INNER JOIN zone_region R ON R.code_reg = D.id_reg WHERE FKT.code_fkt = BNF.id_fkt)
              WHEN BNF.id_fkt IS NULL AND BNF.id_commune IS NOT NULL THEN (SELECT R.nom_reg FROM zone_district D INNER JOIN zone_commune C ON C.id_dist = D.code_dist INNER JOIN zone_region R ON R.code_reg = D.id_reg WHERE C.code_com = BNF.id_commune)
              ELSE NULL END AS nom_region,
              CASE WHEN BNF.id_fkt IS NOT NULL THEN (SELECT D.code_dist FROM zone_commune C INNER JOIN zone_fonkotany FKT ON FKT.id_com = C.code_com INNER JOIN zone_district D ON D.code_dist = C.id_dist WHERE FKT.code_fkt = BNF.id_fkt)
              WHEN BNF.id_fkt IS NULL AND BNF.id_commune IS NOT NULL THEN (SELECT D.code_dist FROM zone_district D INNER JOIN zone_commune C ON C.id_dist = D.code_dist WHERE C.code_com = BNF.id_commune)
              ELSE NULL END AS code_dist,
              CASE WHEN BNF.id_fkt IS NOT NULL THEN (SELECT D.nom_dist FROM zone_commune C INNER JOIN zone_fonkotany FKT ON FKT.id_com = C.code_com INNER JOIN zone_district D ON D.code_dist = C.id_dist WHERE FKT.code_fkt = BNF.id_fkt)
              WHEN BNF.id_fkt IS NULL AND BNF.id_commune IS NOT NULL THEN (SELECT D.nom_dist FROM zone_district D INNER JOIN zone_commune C ON C.id_dist = D.code_dist WHERE C.code_com = BNF.id_commune)
              ELSE NULL END AS nom_dist,
              CASE WHEN BNF.id_fkt IS NOT NULL THEN (SELECT C.code_com FROM zone_commune C INNER JOIN zone_fonkotany FKT ON FKT.id_com = C.code_com WHERE FKT.code_fkt = BNF.id_fkt)
              WHEN BNF.id_fkt IS NULL AND BNF.id_commune IS NOT NULL THEN BNF.id_commune
              ELSE NULL END AS code_commune,
              CASE WHEN BNF.id_fkt IS NOT NULL THEN (SELECT C.nom_com FROM zone_commune C INNER JOIN zone_fonkotany FKT ON FKT.id_com = C.code_com WHERE FKT.code_fkt = BNF.id_fkt)
              WHEN BNF.id_fkt IS NULL AND BNF.id_commune IS NOT NULL THEN (SELECT COM.nom_com FROM zone_commune COM WHERE COM.code_com = BNF.id_commune) 
              ELSE NULL END AS commune,
              CASE WHEN BNF.id_fkt IS NOT NULL THEN (SELECT FKT.nom_fkt FROM zone_fonkotany FKT WHERE FKT.code_fkt = BNF.id_fkt)
              WHEN BNF.id_fkt IS NULL AND BNF.village IS NOT NULL THEN BNF.village  
              ELSE NULL END AS fokontany,
              CASE WHEN BNF.dt_nais IS NOT NULL THEN BNF.dt_nais
              WHEN BNF.dt_nais_vers IS NOT NULL THEN BNF.dt_nais_vers
              ELSE NULL END AS date_naissance
              FROM benef_activ_pr BAPR
              INNER JOIN projet PRJ ON PRJ.code_proj = BAPR.id_proj
              INNER JOIN participe_proj_activ PPA ON PPA.id_activ = BAPR.id_activ AND PPA.id_proj = BAPR.id_proj
              INNER JOIN beneficiaire BNF ON BNF.code_benef = BAPR.id_benef
              INNER JOIN equipe EQ ON EQ.code_equipe = BAPR.id_tech
              INNER JOIN collaborateur COL ON COL.code_col = BAPR.id_collaborateur
              WHERE BAPR.status = "active" AND PRJ.statuts = "activer" AND PPA.statuts = "active" AND BNF.statut = "active" AND EQ.statuts = "active" AND BAPR.id_tech = ${data.id_tech} AND BAPR.id_proj = "${data.code_projet}"`;
    return await this.db.query(req);
  }
  async loadPRParceBloc(data: any) {
    const req = `SELECT BAPR.code_pr, CEP.code_parce, CEP.code_parce_temp, CEP.id_bloc, CEP.id_benef, CEP.ref_gps, CEP.lat, CEP.log, CEP.superficie, CEP.id_commune, CEP.id_fkt, CEP.village, CEP.anne_adheran, CEP.dt_creation, CEP.etat, CEP.status,
        CASE WHEN CEP.id_bloc IS NOT NULL THEN (SELECT BL.nom FROM bloc BL WHERE BL.code_bloc = CEP.id_bloc)
        ELSE NULL END AS bloc_cep,
        CASE WHEN CEP.id_fkt IS NOT NULL THEN (SELECT R.code_reg FROM zone_fonkotany FKT INNER JOIN zone_commune C ON C.code_com = FKT.id_com INNER JOIN zone_district D ON D.code_dist = C.id_dist INNER JOIN zone_region R ON R.code_reg = D.id_reg WHERE FKT.code_fkt = CEP.id_fkt)
        WHEN CEP.id_fkt IS NULL AND CEP.id_commune IS NOT NULL THEN (SELECT R.code_reg FROM zone_district D INNER JOIN zone_commune C ON C.id_dist = D.code_dist INNER JOIN zone_region R ON R.code_reg = D.id_reg WHERE C.code_com = CEP.id_commune)
        ELSE NULL END AS code_region,
        CASE WHEN CEP.id_fkt IS NOT NULL THEN (SELECT R.nom_reg FROM zone_fonkotany FKT INNER JOIN zone_commune C ON C.code_com = FKT.id_com INNER JOIN zone_district D ON D.code_dist = C.id_dist INNER JOIN zone_region R ON R.code_reg = D.id_reg WHERE FKT.code_fkt = CEP.id_fkt)
        WHEN CEP.id_fkt IS NULL AND CEP.id_commune IS NOT NULL THEN (SELECT R.nom_reg FROM zone_district D INNER JOIN zone_commune C ON C.id_dist = D.code_dist INNER JOIN zone_region R ON R.code_reg = D.id_reg WHERE C.code_com = CEP.id_commune)
        ELSE NULL END AS nom_region,
        CASE WHEN CEP.id_fkt IS NOT NULL THEN (SELECT D.code_dist FROM zone_fonkotany FKT INNER JOIN zone_commune C ON C.code_com = FKT.id_com INNER JOIN zone_district D ON D.code_dist = C.id_dist WHERE FKT.code_fkt = CEP.id_fkt)
        WHEN CEP.id_fkt IS NULL AND CEP.id_commune IS NOT NULL THEN (SELECT D.code_dist FROM zone_district D INNER JOIN zone_commune C ON C.id_dist = D.code_dist WHERE C.code_com = CEP.id_commune)
        ELSE NULL END AS code_district,
        CASE WHEN CEP.id_fkt IS NOT NULL THEN (SELECT D.nom_dist FROM zone_fonkotany FKT INNER JOIN zone_commune C ON C.code_com = FKT.id_com INNER JOIN zone_district D ON D.code_dist = C.id_dist WHERE FKT.code_fkt = CEP.id_fkt)
        WHEN CEP.id_fkt IS NULL AND CEP.id_commune IS NOT NULL THEN (SELECT D.nom_dist FROM zone_district D INNER JOIN zone_commune C ON C.id_dist = D.code_dist WHERE C.code_com = CEP.id_commune)
        ELSE NULL END AS district,
        CASE WHEN CEP.id_fkt IS NOT NULL THEN (SELECT COM.code_com FROM zone_fonkotany FKT INNER JOIN zone_commune COM ON COM.code_com = FKT.id_com WHERE FKT.code_fkt = CEP.id_fkt)
        WHEN CEP.id_fkt IS NULL AND CEP.id_commune IS NOT NULL THEN CEP.id_commune
        ELSE NULL END AS code_commune,
        CASE WHEN CEP.id_fkt IS NOT NULL THEN (SELECT C.nom_com FROM zone_fonkotany FKT INNER JOIN zone_commune C ON C.code_com = FKT.id_com WHERE FKT.code_fkt = CEP.id_fkt)
        WHEN CEP.id_fkt IS NULL AND CEP.id_commune IS NOT NULL THEN (SELECT C.nom_com FROM zone_commune C WHERE C.code_com = CEP.id_commune)
        ELSE NULL END AS commune,
        CASE WHEN CEP.id_fkt IS NOT NULL THEN (SELECT FKT.nom_fkt FROM zone_fonkotany FKT WHERE FKT.code_fkt = CEP.id_fkt)
        WHEN CEP.id_fkt IS NULL AND CEP.village IS NOT NULL THEN CEP.village
        ELSE NULL END AS fokontany
        FROM cep_parce CEP
        INNER JOIN beneficiaire BNF ON BNF.code_benef = CEP.id_benef
        INNER JOIN benef_activ_pr BAPR ON BAPR.id_benef = BNF.code_benef AND BAPR.status = "active"
        WHERE CEP.status = "active" AND BAPR.id_proj = "${data.code_projet}" AND BAPR.id_tech = ${data.id_tech}`;
    return await this.db.query(req);
  }

  async loadAnimationVe(data: any) {
    const req  = `SELECT BNF.code_benef, BNF.nom, BNF.prenom, BNF.cin, PR.code_pr, PR.code_pr_temp, PR.code_achat, ANIM.code AS code_anime, ANIM.id_pr, ANIM.id_fkt, ANIM.village, ANIM.date_anim, ANIM.nb_participant, ANIM.nb_h, ANIM.nb_f, ANIM.nb_inf_25, ANIM.type, ANIM.img_piece, ANIM.img_group_particip, ANIM.id_tech_recenseur, ANIM.etat, ANIM.status,
                (SELECT COUNT(*) FROM animation_ve_specu SPEC WHERE SPEC.id_anime_ve = ANIM.code) AS nb_specu, (SELECT SUM(SPEC.quantite) FROM animation_ve_specu SPEC WHERE SPEC.id_anime_ve = ANIM.code) AS somme_specu,
                CASE WHEN ANIM.id_fkt IS NOT NULL THEN (SELECT R.code_reg FROM zone_fonkotany FKT INNER JOIN zone_commune C ON C.code_com = FKT.id_com INNER JOIN zone_district D ON D.code_dist = C.id_dist INNER JOIN zone_region R ON R.code_reg = D.id_reg WHERE FKT.code_fkt = ANIM.id_fkt)
                WHEN ANIM.id_fkt IS NULL AND ANIM.village IS NOT NULL AND ANIM.id_commune IS NOT NULL THEN (SELECT R.code_reg FROM zone_commune C INNER JOIN zone_district D ON D.code_dist = C.id_dist INNER JOIN zone_region R ON R.code_reg = D.id_reg WHERE C.code_com = ANIM.id_commune)
                ELSE NULL END AS code_reg,
                CASE WHEN ANIM.id_fkt IS NOT NULL THEN (SELECT D.code_dist FROM zone_fonkotany FKT INNER JOIN zone_commune C ON C.code_com = FKT.id_com INNER JOIN zone_district D ON D.code_dist = C.id_dist WHERE FKT.code_fkt = ANIM.id_fkt)
                WHEN ANIM.id_fkt IS NULL AND ANIM.village IS NOT NULL AND ANIM.id_commune IS NOT NULL THEN (SELECT D.code_dist FROM zone_commune C INNER JOIN zone_district D ON D.code_dist = C.id_dist WHERE C.code_com = ANIM.id_commune)
                ELSE NULL END AS code_dist,
                CASE WHEN ANIM.id_fkt IS NOT NULL THEN (SELECT D.nom_dist FROM zone_fonkotany FKT INNER JOIN zone_commune C ON C.code_com = FKT.id_com INNER JOIN zone_district D ON D.code_dist = C.id_dist WHERE FKT.code_fkt = ANIM.id_fkt)
                WHEN ANIM.id_fkt IS NULL AND ANIM.village IS NOT NULL AND ANIM.id_commune IS NOT NULL THEN (SELECT D.nom_dist FROM zone_commune C INNER JOIN zone_district D ON D.code_dist = C.id_dist WHERE C.code_com = ANIM.id_commune)
                ELSE NULL END AS nom_dist,
                CASE WHEN ANIM.id_fkt IS NOT NULL THEN (SELECT C.code_com FROM zone_fonkotany FKT INNER JOIN zone_commune C ON C.code_com = FKT.id_com WHERE FKT.code_fkt = ANIM.id_fkt)
                WHEN ANIM.id_fkt IS NULL AND ANIM.village IS NOT NULL AND ANIM.id_commune IS NOT NULL THEN (SELECT C.code_com FROM zone_commune C WHERE C.code_com = ANIM.id_commune)
                ELSE NULL END AS code_commune,
                CASE WHEN ANIM.id_fkt IS NOT NULL THEN (SELECT C.nom_com FROM zone_fonkotany FKT INNER JOIN zone_commune C ON C.code_com = FKT.id_com WHERE FKT.code_fkt = ANIM.id_fkt)
                WHEN ANIM.id_fkt IS NULL AND ANIM.village IS NOT NULL AND ANIM.id_commune IS NOT NULL THEN (SELECT C.nom_com FROM zone_commune C WHERE C.code_com = ANIM.id_commune)
                ELSE NULL END AS commune,
                CASE WHEN ANIM.id_fkt IS NOT NULL THEN (SELECT FKT.nom_fkt FROM zone_fonkotany FKT WHERE FKT.code_fkt = ANIM.id_fkt)
                WHEN ANIM.id_fkt IS NULL AND ANIM.village IS NOT NULL AND ANIM.id_commune IS NOT NULL THEN ANIM.village
                ELSE NULL END AS fokontany, 
                CASE WHEN BNF.dt_nais IS NOT NULL THEN BNF.dt_nais
                WHEN BNF.dt_nais_vers IS NULL AND BNF.dt_nais IS NULL THEN BNF.dt_nais_vers END AS date_naissance
                FROM animation_ve ANIM
                INNER JOIN benef_activ_pr PR ON PR.code_pr = ANIM.id_pr AND PR.status = "active"
                INNER JOIN activite A ON A.code_act = PR.id_activ
                INNER JOIN beneficiaire BNF ON BNF.code_benef = PR.id_benef AND BNF.statut = "active"
                INNER JOIN equipe EQ ON EQ.code_equipe = PR.id_tech AND EQ.statuts = "active"
                INNER JOIN projet PRJ ON PRJ.code_proj = PR.id_proj AND PRJ.statuts = "activer"
                INNER JOIN projet_equipe PE ON PE.id_projet = PRJ.code_proj AND EQ.code_equipe = PE.id_equipe AND PE.status_pe = "active"
                INNER JOIN projet_equipe_volet PEV ON PEV.id_volet = A.id_volet AND PEV.id_equipe = PR.id_tech AND PEV.status_pev = "active"
                WHERE ANIM.status = "active" AND PRJ.code_proj = "${data.code_projet}" AND EQ.code_equipe = ${data.code_equipe}`;
    return await this.db.query(req);
  }

  async loadAnimeSpecu(data: any) {
    const req = `SELECT SPECU.code_specu, SPECU.id_anime_ve, SPECU.id_var, SPECU.id_espece, SPECU.quantite, SPECU.etat, SPECU.status,
            CASE WHEN SPECU.id_var IS NOT NULL THEN (SELECT E.nom_espece || ' ' || V.nom_var FROM variette V INNER JOIN espece E ON E.code_espece = V.id_espece WHERE V.code_var = SPECU.id_var)
            WHEN SPECU.id_espece IS NOT NULL THEN (SELECT E.nom_espece FROM espece E WHERE E.code_espece = SPECU.id_espece)
            ELSE NULL END AS speculation,
            CASE WHEN SPECU.id_var IS NOT NULL THEN (SELECT E.unite FROM variette V INNER JOIN espece E ON E.code_espece = V.id_espece WHERE V.code_var = SPECU.id_var)
            WHEN SPECU.id_espece IS NOT NULL THEN (SELECT E.unite FROM espece E WHERE E.code_espece = SPECU.id_espece)
            ELSE NULL END AS unite_espece
            FROM animation_ve_specu SPECU
            INNER JOIN animation_ve ANIM ON ANIM.code = SPECU.id_anime_ve AND ANIM.status = "active"
            INNER JOIN benef_activ_pr BAPR ON BAPR.code_pr = ANIM.id_pr AND BAPR.status = "active"
            INNER JOIN equipe EQ ON EQ.code_equipe = BAPR.id_tech AND EQ.statuts = "active"
            INNER JOIN projet PRJ ON PRJ.code_proj = BAPR.id_proj AND PRJ.statuts = "activer"
            INNER JOIN projet_equipe PE ON PE.id_projet = PRJ.code_proj AND PE.id_equipe = EQ.code_equipe AND PE.status_pe = "active"
            WHERE SPECU.status = "active" AND PRJ.code_proj = "${data.code_projet}" AND EQ.code_equipe = ${data.code_equipe}`;
    return await this.db.query(req);
  }

  async loadMepPR(data: any) {
    let req = `SELECT MEP.code_culture, MEP.code_culture_temp, MEP.id_parce, CEP.code_parce, CEP.code_parce_temp, CEP.lat, CEP.log,  CEP.superficie AS sfce_reel, BAPR.code_pr, BAPR.code_pr_temp, BAPR.code_achat, BNF.img_benef, BNF.nom, BNF.prenom, BNF.sexe, BNF.dt_nais, BNF.dt_nais_vers, BNF.cin, MEP.id_espece, MEP.id_var, MEP.id_saison, MEP.id_annee, AN_.annee_du, AN_.annee_au, MEP.ddp, MEP.qso, MEP.dt_distribution, MEP.dds, MEP.sfce AS sfce_emb, MEP.nbre_ligne, MEP.long_ligne, MEP.usage, MEP.sc, MEP.ea_autres, MEP.ea_id_variette, MEP.dt_creation, MEP.dt_modification, MEP.status, MEP.etat AS etat_mep, MEP.id_equipe, MEP.type, CEP.etat AS etat_cep, BNF.etat AS etat_benef, BAPR.etat AS etat_benef_pr,
                CASE WHEN MEP.id_var IS NOT NULL THEN (SELECT E.code_espece FROM variette V INNER JOIN espece E ON E.code_espece = V.id_espece WHERE V.code_var = MEP.id_var)
                ELSE NULL END AS code_espece_var_sg,
                CASE WHEN MEP.id_espece IS NOT NULL AND MEP.id_var IS NULL THEN (SELECT ESP.nom_espece FROM espece ESP WHERE ESP.code_espece = MEP.id_espece)
                WHEN MEP.id_var IS NOT NULL AND MEP.id_espece IS NULL THEN (SELECT (ESP.nom_espece || ' ' || VAR.nom_var) AS varie FROM variette VAR INNER JOIN espece ESP ON ESP.code_espece = VAR.id_espece WHERE VAR.code_var = MEP.id_var)
                END AS variette,
                CASE WHEN MEP.id_espece IS NOT NULL AND MEP.id_var IS NULL THEN (SELECT ESP.unite FROM espece ESP WHERE ESP.code_espece = MEP.id_espece)
                WHEN MEP.id_var IS NOT NULL AND MEP.id_espece IS NULL THEN (SELECT ESP.unite FROM variette VAR INNER JOIN espece ESP ON ESP.code_espece = VAR.id_espece WHERE VAR.code_var = MEP.id_var)
                END AS unite_espece,
                CASE WHEN MEP.id_espece IS NOT NULL AND MEP.id_var IS NULL THEN (SELECT ESP.unite_estimation FROM espece ESP WHERE ESP.code_espece = MEP.id_espece)
                WHEN MEP.id_var IS NOT NULL AND MEP.id_espece IS NULL THEN (SELECT ESP.unite_estimation FROM variette VAR INNER JOIN espece ESP ON ESP.code_espece = VAR.id_espece WHERE VAR.code_var = MEP.id_var)
                END AS unite_estimation,
                CASE WHEN MEP.ea_id_variette IS NOT NULL THEN (SELECT E.code_espece FROM variette V INNER JOIN espece E ON E.code_espece = V.id_espece WHERE V.code_var = MEP.ea_id_variette)
                ELSE NULL END AS code_espece_ea,
                CASE WHEN MEP.ea_id_variette IS NOT NULL THEN (SELECT (E.nom_espece || ' ' || V.nom_var) AS associe FROM variette V INNER JOIN espece E ON E.code_espece = V.id_espece WHERE V.code_var = MEP.ea_id_variette)
                WHEN MEP.ea_autres IS NOT NULL THEN MEP.ea_autres
                END AS cult_associe,
                CASE WHEN MEP.id_saison IS NOT NULL THEN (SELECT SS.intitule FROM saison SS WHERE SS.code_saison = MEP.id_saison)
                END AS saison,
                CASE WHEN BNF.dt_nais IS NOT NULL THEN BNF.dt_nais
                WHEN  BNF.dt_nais_vers IS NOT NULL  AND BNF.dt_nais IS NULL THEN BNF.dt_nais_vers END AS date_naissance
                FROM culture_pr MEP
                INNER JOIN cep_parce CEP ON CEP.code_parce = MEP.id_parce AND CEP.status = "active"
                INNER JOIN beneficiaire BNF ON BNF.code_benef = CEP.id_benef AND BNF.statut = "active"
                INNER JOIN benef_activ_pr BAPR ON BAPR.id_benef = BNF.code_benef AND BAPR.status = "active"
                INNER JOIN equipe EQ ON EQ.code_equipe = BAPR.id_tech AND EQ.statuts = "active"
                INNER JOIN projet PRJ ON PRJ.code_proj = BAPR.id_proj AND PRJ.statuts = "activer"
                INNER JOIN projet_equipe PE ON PE.id_projet = PRJ.code_proj AND PE.id_equipe = EQ.code_equipe AND PE.status_pe = "active"
                INNER JOIN annee_agricole AN_ ON AN_.code = MEP.id_annee
                WHERE  MEP.status = "active" `;
    
    if(data.code_projet != undefined && data.code_equipe != undefined && data.type != undefined && data.id_saison != undefined && data.annee_du != undefined) {
      req += ` AND PRJ.code_proj = "${data.code_projet}" AND EQ.code_equipe = ${data.code_equipe} AND AN_.code = ${data.annee_du} AND MEP.id_saison = "${data.id_saison}" AND MEP.type = "${data.type}" ORDER BY MEP.code_culture_temp`;
    } else if(data.code_projet != undefined && data.code_equipe != undefined && data.type != undefined && data.annee_du != undefined) {
      req += ` AND PRJ.code_proj = "${data.code_projet}" AND EQ.code_equipe = ${data.code_equipe} AND AN_.code = ${data.annee_du} AND MEP.type = "${data.type}" AND MEP.id_saison IS NULL ORDER BY MEP.code_culture_temp`;
    } else if (data.code_projet != undefined && data.code_equipe != undefined) {
      req += `  AND BAPR.id_proj = "${data.code_projet}" AND BAPR.id_tech = ${data.code_equipe} ORDER BY MEP.code_culture_temp`;
    }
    return await this.db.query(req);
  }

  async loadSuiviMepPR(data: any) {
    const req = `SELECT BAPR.code_pr, BNF.nom, BNF.prenom, MEP.id_espece, MEP.id_var, MEP.dt_distribution, MEP.qso, MEP.dds, MEP.sc, MEP.sfce AS sfce_emblavee, CEP.code_parce, CEP.code_parce_temp, CEP.superficie AS sfce_reel, MEP.type AS type_mep, SV.code_sv, SV.id_culture, SV.ddp, SV.stc, SV.ql, SV.qr, SV.long_ligne, SV.nbre_ligne, SV.nbre_pied, SV.hauteur, SV.ec, SV.img_cult, SV.dt_capture, SV.ex, SV.dt_creation, SV.dt_modification, SV.etat AS etat_suivi, MEP.etat AS etat_mep, CEP.etat AS etat_cep, BAPR.etat AS etat_pr,
              CASE WHEN MEP.id_var IS NOT NULL THEN (SELECT (E.nom_espece || ' ' || V.nom_var) AS espec_var FROM variette V INNER JOIN espece E ON E.code_espece = V.id_espece WHERE V.code_var = MEP.id_var)
              WHEN MEP.id_espece IS NOT NULL THEN (SELECT E.nom_espece FROM espece E WHERE E.code_espece = MEP.id_espece)
              END AS variette,
              CASE WHEN MEP.id_var IS NOT NULL THEN (SELECT E.unite FROM variette V INNER JOIN espece E ON E.code_espece = V.id_espece WHERE V.code_var = MEP.id_var)
              WHEN MEP.id_espece IS NOT NULL THEN (SELECT E.unite FROM espece E WHERE E.code_espece = MEP.id_espece)
              END AS unite_estimation
              FROM suivi_pr SV
              INNER JOIN culture_pr MEP ON MEP.code_culture = SV.id_culture AND MEP.status = "active"
              INNER JOIN cep_parce CEP ON CEP.code_parce = MEP.id_parce AND CEP.status = "active"
              INNER JOIN benef_activ_pr BAPR ON BAPR.id_benef = CEP.id_benef AND BAPR.status = "active"
              INNER JOIN beneficiaire BNF ON BNF.code_benef = BAPR.id_benef AND BNF.statut = "active"
              INNER JOIN equipe EQ ON EQ.code_equipe = BAPR.id_tech AND EQ.statuts = "active"
              INNER JOIN projet PRJ ON PRJ.code_proj = BAPR.id_proj AND PRJ.statuts = "activer"
              INNER JOIN projet_equipe PE ON PE.id_projet = PRJ.code_proj AND PE.id_equipe = EQ.code_equipe AND PE.status_pe = "active"
              WHERE BAPR.id_proj = "${data.code_projet}" AND BAPR.id_tech = ${data.code_equipe}`;
    return await this.db.query(req);
  }
  async findAnimationVePR(code_pr: string) {
    const state = `SELECT code AS code_anime, id_pr, id_fkt, id_commune, village, date_anim, nb_participant, nb_h, nb_f, nb_inf_25, type, img_piece, img_group_particip, id_tech_recenseur, etat, status 
                  FROM animation_ve WHERE id_pr = "${code_pr}"`;
    return await this.db.query(state);
  }
  async findSpecuAnime(code_anime: string) {
    const state = `SELECT * FROM animation_ve_specu WHERE id_anime_ve = "${code_anime}"`;
    return await this.db.query(state);
  }
  async findCepPR(code_benef: string) {
    const state = `SELECT code_parce, code_parce_temp, id_bloc, id_benef, ref_gps, lat, log, superficie, id_commune, id_fkt, village, anne_adheran, dt_creation, etat, status 
                  FROM cep_parce WHERE id_benef = "${code_benef}";`;
    return await this.db.query(state);
  }
  async findMepCepPR(code_cep: any) {
    const state = `SELECT code_culture, id_parce, id_espece, id_var, id_saison, id_annee, ddp, qso, dt_distribution, dds, sfce, nbre_ligne, long_ligne, usage, sc, ea_autres, ea_id_variette, dt_creation, dt_modification, status, etat, id_equipe, type 
                FROM culture_pr WHERE id_parce = "${code_cep}"`;
    return await this.db.query(state);
  }
  async findSuiviMepPR(data: any) {
    const state = `SELECT code_sv, id_culture, ddp, stc, ql, qr, long_ligne, nbre_ligne, nbre_pied, hauteur, ec, img_cult, dt_capture, ex, dt_creation, dt_modification, etat 
                  FROM suivi_pr WHERE id_culture = "${data.code_mep}"`;
    return await this.db.query(state);
  }

  async loadCodePRBloc(data: any) {
    const state = `SELECT BAPR.code_pr, BAPR.code_pr_temp, BAPR.id_proj, BAPR.id_activ, BAPR.id_benef, BAPR.id_bloc, BAPR.code_achat, BAPR.id_collaborateur, BAPR.id_tech, BAPR.etat, BAPR.status
                  FROM benef_activ_pr BAPR
                  WHERE BAPR.id_tech = ${data.id_tech} AND BAPR.id_proj = "${data.code_prj}" AND BAPR.status = "active"
                  ORDER BY BAPR.code_pr_temp`;
    return await this.db.query(state);
  }

  async loadCodeCepPR(data: any) {
    const state = `SELECT CEP.code_parce, CEP.code_parce_temp, CEP.id_bloc, CEP.id_benef, CEP.ref_gps, CEP.lat, CEP.log, CEP.superficie, CEP.id_commune, CEP.id_fkt, CEP.village, CEP.anne_adheran, CEP.dt_creation, CEP.etat, CEP.status
                FROM cep_parce CEP
                INNER JOIN beneficiaire BNF ON BNF.code_benef = CEP.id_benef
                WHERE CEP.status = "active" AND BNF.code_benef IN(SELECT BAPR.id_benef FROM benef_activ_pr BAPR WHERE BAPR.status = "active" AND BAPR.id_proj = "${data.code_prj}" AND BAPR.id_tech = ${data.id_tech})
                ORDER BY CEP.code_parce_temp`;
    return await this.db.query(state);
  }

  async loadBenefPRTemp(data: any) {
    const req = `SELECT BAPR.code_pr, BAPR.id_proj, BAPR.id_activ, BAPR.id_benef, BAPR.id_bloc, BAPR.code_achat, BAPR.id_collaborateur, BAPR.id_tech, BAPR.etat, BAPR.status 
                FROM benef_activ_pr BAPR
                INNER JOIN equipe EQ ON EQ.code_equipe = BAPR.id_tech AND EQ.statuts = "active"
                INNER JOIN projet PRJ ON PRJ.code_proj = BAPR.id_proj AND PRJ.statuts = "activer"
                INNER JOIN projet_equipe PE ON PE.id_projet = PRJ.code_proj AND PE.id_equipe = EQ.code_equipe AND PE.status_pe = "active"
                WHERE BAPR.etat == "${SYNC}" AND BAPR.status = "active" AND EQ.code_equipe = ${data.code_equipe} AND PRJ.code_proj = "${data.code_projet}"`;
    return await this.db.query(req);
  }

  async loadBlocEquipe(data: any) {
    const req = `SELECT B.code_bloc, B.nom, B.ancronyme, B.id_prjt, B.id_tech, B.status 
                FROM bloc B
                INNER JOIN projet_equipe PE ON PE.id_projet = B.id_prjt AND PE.id_equipe = B.id_tech AND PE.status_pe = "active"
                WHERE B.id_prjt = "${data.code_projet}" AND B.id_tech = ${data.id_tech} AND B.status = "active"`;
    return this.db.query(req);
  }

  async loadAnneeAgricole() {
    const req = `SELECT AN_AG.code, AN_AG.annee_du, AN_AG.annee_au, AN_AG.statut FROM annee_agricole AN_AG`;
    return await this.db.query(req);
  }

   async loadAllTable(table: string) {
      const req = `SELECT * FROM ${table}`;
      return await this.db.query(req);
   }

  getStateQuer() {
    return this.dbReady.asObservable();
  }

  getActivitePr(): Observable<any[]> {
    return this.active_projet.asObservable();
  }

  getUsers(): Observable<Utilisateurs[]> {
    return this.users.asObservable();
  }
  getUsersSingle(): Observable<Utilisateurs[]> {
    return this.users_single.asObservable();
  }
  async exportAllBenefInfo(data: any) {
    const req = `SELECT B.code_benef, B.img_benef, B.nom, B.prenom, B.sexe, B.dt_nais, B.dt_nais_vers, B.surnom, B.cin, B.dt_delivrance, B.lieu_delivrance, B.img_cin, B.contact, B.id_fkt, B.id_commune, B.village, B.dt_Insert, B.etat, B.statut
                          FROM benef_activ_pms BPMS 
                          INNER JOIN projet P ON P.code_proj = BPMS.id_proj AND P.statuts = "activer"
                          INNER JOIN activite A ON A.code_act = BPMS.id_activ
                          INNER JOIN beneficiaire B ON B.code_benef = BPMS.id_benef AND B.statut = "active"
                          INNER JOIN association ASS ON ASS.code_ass = BPMS.id_association AND ASS.status = "active"
                          INNER JOIN collaborateur C ON C.code_col = BPMS.id_collaborateur
                          INNER JOIN zone_fonkotany FKT_ASS ON FKT_ASS.code_fkt = ASS.id_fkt
                          WHERE BPMS.status = "active" AND BPMS.id_association =  "${data.code_ass}"`;
    return await this.db.query(req);
  }
  async exportAllAssociation() {
    const req = `SELECT * FROM association`;
    return await this.db.query(req);
  }
  async exportAllPms() {
    const req = `SELECT code_benef_pms, code_pms_temp, code_achat, id_proj, id_benef, id_activ, id_association, id_collaborateur, status, etat FROM benef_activ_pms`;
    return await this.db.query(req);
  }
  async exportAllAssocParce() {
    const req = `SELECT code_parce, code_parce_temp, id_assoc, id_benef, ref_gps, lat, log, superficie, id_fkt, id_commune, village, anne_adheran, indication, etat, status FROM assoc_parce`;
    return await this.db.query(req);
  }
  async exportAllContrat() {
    const req = `SELECT code, code_contrat, id_annee, id_saison, id_pms, id_parce, ref_gps, lat, log, id_var, objectif, etat, commentaire FROM assoc_parce_saison`;
    return await this.db.query(req);
  }
  async exportAllMEP() {
    const req = `SELECT code_culture, id_contrat, id_parce, id_var, id_saison, id_annee, ddp, qsa, img_fact, dds, sfce, sc, ea_id_variette, ea_autres, dt_creation, dt_modification, statuts, Etat FROM cultures_pms`;
    return await this.db.query(req);
  }
  async exportAllsuivi() {
    const req = `SELECT id, id_culture, ddp, stc, ec, pb, ex, name, controle, declaration, etat FROM suivi_pms`;
    return await this.db.query(req);
  }
}

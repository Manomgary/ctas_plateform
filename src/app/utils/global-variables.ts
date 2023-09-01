// variable globale
export const DB_NAME_KEY = 'db_name';
export const DB_NAME = 'ctas-db';
export const FIRST_CONNECT_KEY = 'first_connection';

export const BASE_PATH = 'http://192.168.1.195:8080/api/';
//export const BASE_PATH = 'http://192.168.43.57:8080/api/';
// FOLDER IMAGE
export const IMAGE_DIR = 'stored-images';
// Bloc Suivi
export const SG = 'sg';
export const PA = 'pa';
export const MV = 'mv';
// Etat rows table
export const SYNC = 'ToSync';
export const ISSYNC = 'isSync';
export const UPDATE = "ToUpdate";
export const ISUPDATE = "isUpdate";
export const VALIDE = "valide";
//Statut MEP
export const ACTIVE = 'active';
export const EC = "EC"; // En Cours
export const RC = "RC"; // Récolter
export const CL = "CL"; // Cloturer

// data
export const SC =  [
    {value: 'C.Pure', description: 'Culture Pure'}, 
    {value: 'C.associé', description: 'Culture associé'}, 
    {value: 'C.bande', description: 'Culture bande'}
  ];
export const STC = [
    {value: 'LEV', intitule: 'Levée'},
    {value: 'FEU', intitule: 'Feuilles'},
    {value: 'RAM', intitule: 'Ramification'},
    {value: 'TAL', intitule: 'Tallage'},
    {value: 'MON', intitule: 'Montaison'},
    {value: 'FLO', intitule: 'Floraison'},
    {value: 'EPI', intitule: 'Epiaison'},
    {value: 'FPEN', intitule: 'Formation panicule'},
    {value: 'FCHAND', intitule: 'Formation des gousses'},
    {value: 'FGR', intitule: 'Formation de grains'},
    {value: 'STLAIT', intitule: 'Stade Laiteux'},
    {value: 'STPAT', intitule: 'Stade Pâteux'},
    {value: 'DM', intitule: 'Début Maturation'},
    {value: 'MAT', intitule: 'Maturation'},
    {value: 'REC', intitule: 'Récolte'},
    {value: 'PREC', intitule: 'Post-Récolte'},
    {value: 'ECHEC', intitule: 'Echec'}
  ];
export const EC_CULTURAL = [
  {value: 'TMV', intitule: 'Mauvais état'},
  {value: 'MM', intitule: 'Moyen'},
  {value: 'BON', intitule: 'Bon état'},
  {value: 'TBE', intitule: 'Trés bon état'},
  {value: 'ECHEC', intitule: 'Echec'},
];
export const DECLARATION_MEP = [
  {
    value: 'oui'
  },
  {
    value: 'non'
  }
]
export const CONTROLE_MEP = [
  {value: 'accepte', description: 'Accepter'},
  {value: 'refuse', description: 'Réfuser'}
]
export const ROLE_CACT_INERME  = [
  'Plein champ',
  'forage',
  'Brise vent'
]
export const SEXE = [
  {value: 'H', description: 'Homme'},
  {value: 'F', description: 'Femme'}
];
// Type Animation
export const ANIMATION = "animation";
export const VE = "ve";
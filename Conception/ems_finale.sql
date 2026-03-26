/*==============================================================*/
/* DBMS name:      MySQL 5.0                                    */
/* Created on:     2/7/2026 3:54:26 PM                          */
/*==============================================================*/


alter table ADMINISTRATIVE_CERTIFICATE 
   drop foreign key FK_ADMINIST_AC_IS_LIN_RECEIPT_;

alter table ADMINISTRATIVE_CERTIFICATE 
   drop foreign key FK_ADMINIST_AD_IS_BRO_WAREHOUS;

alter table ADMINISTRATIVE_CERTIFICATE 
   drop foreign key FK_ADMINIST_AO_LEADS__ATTRIBUT;

/* Removed AO_IS_LINKED_TO_RR constraints */

alter table ASSET 
   drop foreign key FK_ASSET_ASSET_IS__DESTRUCT;

alter table ASSET 
   drop foreign key FK_ASSET_ASSET_IS__ATTRIBUT;

alter table ASSET 
   drop foreign key FK_ASSET_ASSET_IS__ASSET_MO;

alter table ASSET_ATTRIBUTE_VALUE 
   drop foreign key FK_ASSET_AT_ASSET_ATT_ASSET;

alter table ASSET_ATTRIBUTE_VALUE 
   drop foreign key FK_ASSET_AT_ASSET_ATT_ASSET_AT;

alter table ASSET_CONDITION_HISTORY 
   drop foreign key FK_ASSET_CO_ASSET_CON_PHYSICAL;

alter table ASSET_CONDITION_HISTORY 
   drop foreign key FK_ASSET_CO_ASSET_HAS_ASSET;

alter table ASSET_IS_ASSIGNED_TO_PERSON 
   drop foreign key FK_ASSET_IS_ASSET_IS__PERSON_ASSIGNED;

alter table ASSET_IS_ASSIGNED_TO_PERSON 
   drop foreign key FK_ASSET_IS_ASSET_IS__PERSON_ASSIGNER;

alter table ASSET_IS_ASSIGNED_TO_PERSON 
   drop foreign key FK_ASSET_IS_ASSET_IS__ASSET;

alter table ASSET_IS_COMPOSED_OF_CONSUMABLE_HISTORY 
   drop foreign key FK_ASSET_IS_ASSET_IS__ASSET;

alter table ASSET_IS_COMPOSED_OF_CONSUMABLE_HISTORY 
   drop foreign key FK_ASSET_IS_ASSET_IS__CONSUMAB;

alter table ASSET_IS_COMPOSED_OF_CONSUMABLE_HISTORY 
   drop foreign key FK_ASSET_IS_ASSET_IS__MAINTENA;

alter table ASSET_IS_COMPOSED_OF_STOCK_ITEMS_HISTORY 
   drop foreign key FK_ASSET_IS_ASSET_IS__MAINTENA;

alter table ASSET_IS_COMPOSED_OF_STOCK_ITEMS_HISTORY 
   drop foreign key FK_ASSET_IS_ASSET_IS__ASSET;

alter table ASSET_IS_COMPOSED_OF_STOCK_ITEMS_HISTORY 
   drop foreign key FK_ASSET_IS_ASSET_IS__STOCK_IT;

alter table ASSET_MODEL 
   drop foreign key FK_ASSET_MO_ASSET_MOD_ASSET_BR;

alter table ASSET_MODEL 
   drop foreign key FK_ASSET_MO_ASSET_TYP_ASSET_TY;

alter table ASSET_MODEL_ATTRIBUTE_VALUE 
   drop foreign key FK_ASSET_MO_ASSET_MOD_ASSET_AT;

alter table ASSET_MODEL_ATTRIBUTE_VALUE 
   drop foreign key FK_ASSET_MO_ASSET_MOD_ASSET_MO;

alter table ASSET_MOVEMENT 
   drop foreign key FK_ASSET_MO_ASSET_MOV_EXTERNAL;

alter table ASSET_MOVEMENT 
   drop foreign key FK_ASSET_MO_ASSET_MOV_ASSET;

alter table ASSET_MOVEMENT 
   drop foreign key FK_ASSET_MO_ASSET_MOV_ROOM_SOURCE;

alter table ASSET_MOVEMENT 
   drop foreign key FK_ASSET_MO_ASSET_MOV_ROOM_DEST;

alter table ASSET_MOVEMENT 
   drop foreign key FK_ASSET_MO_ASSET_MOV_MAINTENA;

alter table ASSET_TYPE_ATTRIBUTE 
   drop foreign key FK_ASSET_TY_ASSET_TYP_ASSET_TY;

alter table ASSET_TYPE_ATTRIBUTE 
   drop foreign key FK_ASSET_TY_ASSET_TYP_ASSET_AT;

alter table ATTRIBUTION_ORDER 
   drop foreign key FK_ATTRIBUT_SHIPMENT__WAREHOUS;

alter table AUTHENTICATION_LOG 
   drop foreign key FK_AUTHENTI_USER_HAS__USER_ACC;

alter table BON_DE_COMMANDE 
   drop foreign key FK_BON_DE_C_BDC_IS_MA_SUPPLIER;

alter table BON_DE_LIVRAISON 
   drop foreign key FK_BON_DE_L_BON_DE_CO_BON_DE_C;

alter table BON_DE_RESTE 
   drop foreign key FK_BON_DE_R_BDC_HAS_B_BON_DE_C;

alter table COMPANY_ASSET_REQUEST 
   drop foreign key FK_COMPANY__AO_LEADS__ATTRIBUT;

/* Removed COMPANY_ASSET_REQUEST_IS_LINKED_TO_RECEIPT_REPORT constraints */

alter table CONSUMABLE 
   drop foreign key FK_CONSUMAB_CONSUMABL_DESTRUCT;

alter table CONSUMABLE 
   drop foreign key FK_CONSUMABLE_MODEL;

alter table CONSUMABLE_ATTRIBUTE_VALUE 
   drop foreign key FK_CAV_ATTRIBUTE_DEF;

alter table CONSUMABLE_ATTRIBUTE_VALUE 
   drop foreign key FK_CAV_CONSUMABLE;

alter table CONSUMABLE_CONDITION_HISTORY 
   drop foreign key FK_CONSUMAB_ASSOCIATI_CONSUMAB;

alter table CONSUMABLE_CONDITION_HISTORY_HAS_PHYSICAL_CONDITION 
   drop foreign key FK_CONSUMAB_CONSUMABL_PHYSICAL;

alter table CONSUMABLE_CONDITION_HISTORY_HAS_PHYSICAL_CONDITION 
   drop foreign key FK_CCHHPC_HISTORY;

alter table CONSUMABLE_IS_ASSIGNED_TO_PERSON 
   drop foreign key FK_CONSUMAB_CONSUMABL_PERSON_ASSIGNED;

alter table CONSUMABLE_IS_ASSIGNED_TO_PERSON 
   drop foreign key FK_CIATP_CONSUMABLE;

alter table CONSUMABLE_IS_ASSIGNED_TO_PERSON 
   drop foreign key FK_CONSUMAB_CONSUMABL_PERSON_ASSIGNER;

alter table CONSUMABLE_IS_USED_IN_STOCK_ITEM_HISTORY 
   drop foreign key FK_CIUISIH_CONSUMABLE;

alter table CONSUMABLE_IS_USED_IN_STOCK_ITEM_HISTORY 
   drop foreign key FK_CIUISIH_MAINTENANCE;

alter table CONSUMABLE_IS_USED_IN_STOCK_ITEM_HISTORY 
   drop foreign key FK_CONSUMAB_CONSUMABL_STOCK_IT;

alter table CONSUMABLE_MODEL 
   drop foreign key FK_CM_BRAND;

alter table CONSUMABLE_MODEL 
   drop foreign key FK_CM_TYPE;

alter table CONSUMABLE_MODEL_ATTRIBUTE_VALUE 
   drop foreign key FK_CMAV_ATTRIBUTE_DEF;

alter table CONSUMABLE_MODEL_ATTRIBUTE_VALUE 
   drop foreign key FK_CMAV_MODEL;

alter table CONSUMABLE_MODEL_IS_FOUND_IN_BDC 
   drop foreign key FK_CONSUMAB_CONSUMABL_BON_DE_C;

alter table CONSUMABLE_MODEL_IS_FOUND_IN_BDC 
   drop foreign key FK_CMIFIB_MODEL;

alter table CONSUMABLE_MOVEMENT 
   drop foreign key FK_CM_CONSUMABLE;

alter table CONSUMABLE_MOVEMENT 
   drop foreign key FK_CONSUMAB_CONSUMABL_ROOM_DEST;

alter table CONSUMABLE_MOVEMENT 
   drop foreign key FK_CONSUMAB_CONSUMABL_ROOM_SOURCE;

alter table CONSUMABLE_MOVEMENT 
   drop foreign key FK_CM_MAINTENANCE;

alter table CONSUMABLE_MOVEMENT 
   drop foreign key FK_CONSUMAB_CONSUMABL_EXTERNAL;

alter table CONSUMABLE_TYPE_ATTRIBUTE 
   drop foreign key FK_CTA_ATTRIBUTE_DEF;

alter table CONSUMABLE_TYPE_ATTRIBUTE 
   drop foreign key FK_CTA_TYPE;

alter table C_IS_COMPATIBLE_WITH_A 
   drop foreign key FK_C_IS_COM_C_IS_COMP_ASSET_MO;

alter table C_IS_COMPATIBLE_WITH_A 
   drop foreign key FK_CICWA_CONSUMABLE_MODEL;

alter table C_IS_COMPATIBLE_WITH_SI 
   drop foreign key FK_C_IS_COM_C_IS_COMP_STOCK_IT;

alter table C_IS_COMPATIBLE_WITH_SI 
   drop foreign key FK_CICWSI_CONSUMABLE_MODEL;

alter table EXTERNAL_MAINTENANCE 
   drop foreign key FK_EXTERNAL_MAINTENAN_MAINTENA;

alter table EXTERNAL_MAINTENANCE_DOCUMENT 
   drop foreign key FK_EMD_EXTERNAL_MAINTENANCE;

alter table EXTERNAL_MAINTENANCE_STEP 
   drop foreign key FK_EXTERNAL_EMS_IS_A__EXTERNAL;

alter table EXTERNAL_MAINTENANCE_STEP 
   drop foreign key FK_EMS_EXTERNAL_MAINTENANCE;

alter table EXTERNAL_MAINTENANCE_STEP 
   drop foreign key FK_EMS_PROVIDER;

alter table FACTURE 
   drop foreign key FK_FACTURE_BON_DE_LI_BON_DE_L;

alter table MAINTENANCE 
   drop foreign key FK_MAINTENA_ASSET_IS__ASSET;

alter table MAINTENANCE 
   drop foreign key FK_MAINTENA_MAINTENAN_PERSON;

alter table MAINTENANCE 
   drop foreign key FK_MAINTENA_PERSON_AS_PERSON;

alter table MAINTENANCE 
   drop foreign key FK_MAINTENANCE_ASSIGNED_PERSON;

alter table MAINTENANCE_INSPECTION_LEADS_TO_BROKEN_ITEM_REPORT 
   drop foreign key FK_MAINTENA_MAINTENAN_BROKEN_I;

alter table MAINTENANCE_INSPECTION_LEADS_TO_BROKEN_ITEM_REPORT 
   drop foreign key FK_MILBIR_MAINTENANCE;

alter table MAINTENANCE_STEP 
   drop foreign key FK_MAINTENA_ASSET_CON_ASSET_CO;

alter table MAINTENANCE_STEP 
   drop foreign key FK_MAINTENA_CONSUMABL_CONSUMAB;

alter table MAINTENANCE_STEP 
   drop foreign key FK_MS_MAINTENANCE;

alter table MAINTENANCE_STEP 
   drop foreign key FK_MS_TYPICAL_STEP;

alter table MAINTENANCE_STEP 
   drop foreign key FK_MS_PERSON;

alter table MAINTENANCE_STEP 
   drop foreign key FK_MAINTENA_STOCK_ITE_STOCK_IT;

alter table ORGANIZATIONAL_STRUCTURE_RELATION 
   drop foreign key FK_ORGANIZA_ORGANIZAT_ORGANIZA_PARENT;

alter table ORGANIZATIONAL_STRUCTURE_RELATION 
   drop foreign key FK_ORGANIZA_ORGANIZAT_ORGANIZA_CHILD;

alter table PERSON_ASSIGNMENT 
   drop foreign key FK_PERSON_A_PERSON_HA_PERSON;

alter table PERSON_ASSIGNMENT 
   drop foreign key FK_PERSON_A_PERSON_IS_POSITION;

alter table PERSON_REPORTS_PROBLEM_ON_ASSET 
   drop foreign key FK_PERSON_R_PERSON_RE_ASSET;

alter table PERSON_REPORTS_PROBLEM_ON_ASSET 
   drop foreign key FK_PRPOA_PERSON;

alter table PERSON_REPORTS_PROBLEM_ON_CONSUMABLE 
   drop foreign key FK_PERSON_R_PERSON_RE_CONSUMAB;

alter table PERSON_REPORTS_PROBLEM_ON_CONSUMABLE 
   drop foreign key FK_PRPOC_PERSON;

alter table PERSON_REPORTS_PROBLEM_ON_STOCK_ITEM 
   drop foreign key FK_PRPOSI_PERSON;

alter table PERSON_REPORTS_PROBLEM_ON_STOCK_ITEM 
   drop foreign key FK_PERSON_R_PERSON_RE_STOCK_IT;

alter table PERSON_ROLE_MAPPING 
   drop foreign key FK_PERSON_ROLE_MAPPING_PERSON;

alter table PERSON_ROLE_MAPPING 
   drop foreign key FK_PERSON_ROLE_MAPPING_ROLE;

alter table ROOM_BELONGS_TO_ORGANIZATIONAL_STRUCTURE 
   drop foreign key FK_ROOM_BEL_ROOM_BELO_ROOM;

alter table ROOM_BELONGS_TO_ORGANIZATIONAL_STRUCTURE 
   drop foreign key FK_ROOM_BEL_ROOM_BELO_ORGANIZA;

alter table STOCK_ITEM 
   drop foreign key FK_STOCK_IT_STOCK_ITE_DESTRUCT;

alter table STOCK_ITEM 
   drop foreign key FK_STOCK_ITEM_MODEL;

alter table STOCK_ITEM 
   drop foreign key FK_STOCK_ITEM_MAINTENANCE;

alter table STOCK_ITEM_ATTRIBUTE_VALUE 
   drop foreign key FK_SIAV_STOCK_ITEM;

alter table STOCK_ITEM_ATTRIBUTE_VALUE 
   drop foreign key FK_SIAV_ATTRIBUTE_DEF;

alter table STOCK_ITEM_CONDITION_HISTORY 
   drop foreign key FK_STOCK_IT_STOCK_ITE_PHYSICAL;

alter table STOCK_ITEM_CONDITION_HISTORY 
   drop foreign key FK_SICH_STOCK_ITEM;

alter table STOCK_ITEM_IS_ASSIGNED_TO_PERSON 
   drop foreign key FK_STOCK_IT_STOCK_ITE_PERSON_ASSIGNED;

alter table STOCK_ITEM_IS_ASSIGNED_TO_PERSON 
   drop foreign key FK_SIIATP_STOCK_ITEM;

alter table STOCK_ITEM_IS_ASSIGNED_TO_PERSON 
   drop foreign key FK_STOCK_IT_STOCK_ITE_PERSON_ASSIGNER;

alter table STOCK_ITEM_IS_COMPATIBLE_WITH_ASSET 
   drop foreign key FK_STOCK_IT_STOCK_ITE_ASSET_MO;

alter table STOCK_ITEM_IS_COMPATIBLE_WITH_ASSET 
   drop foreign key FK_SIICWA_STOCK_ITEM_MODEL;

alter table STOCK_ITEM_MODEL 
   drop foreign key FK_SIM_BRAND;

alter table STOCK_ITEM_MODEL 
   drop foreign key FK_SIM_TYPE;

alter table STOCK_ITEM_MODEL_ATTRIBUTE_VALUE 
   drop foreign key FK_SIMAV_MODEL;

alter table STOCK_ITEM_MODEL_ATTRIBUTE_VALUE 
   drop foreign key FK_SIMAV_ATTRIBUTE_DEF;

alter table STOCK_ITEM_MODEL_IS_FOUND_IN_BDC 
   drop foreign key FK_STOCK_IT_STOCK_ITE_BON_DE_C;

alter table STOCK_ITEM_MODEL_IS_FOUND_IN_BDC 
   drop foreign key FK_SIMIFIB_MODEL;

alter table STOCK_ITEM_MOVEMENT 
   drop foreign key FK_STOCK_IT_STOCK_ITE_EXTERNAL;

alter table STOCK_ITEM_MOVEMENT 
   drop foreign key FK_SIM_STOCK_ITEM;

alter table STOCK_ITEM_MOVEMENT 
   drop foreign key FK_STOCK_IT_STOCK_ITE_ROOM_SOURCE;

alter table STOCK_ITEM_MOVEMENT 
   drop foreign key FK_STOCK_IT_STOCK_ITE_ROOM_DEST;

alter table STOCK_ITEM_MOVEMENT 
   drop foreign key FK_SIM_MAINTENANCE;

alter table STOCK_ITEM_TYPE_ATTRIBUTE 
   drop foreign key FK_SITA_TYPE;

alter table STOCK_ITEM_TYPE_ATTRIBUTE 
   drop foreign key FK_SITA_ATTRIBUTE_DEF;

alter table SUPERUSER_CREATES_ACCOUNT 
   drop foreign key FK_SUPERUSE_SUPERUSER_USER_ACC;

alter table SUPERUSER_CREATES_ACCOUNT 
   drop foreign key FK_SUPERUSE_SUPERUSER_USER_ACC;

alter table SUPERUSER_MODIFIES_ACCOUNT 
   drop foreign key FK_SUPERUSE_SUPERUSER_USER_ACC;

alter table SUPERUSER_MODIFIES_ACCOUNT 
   drop foreign key FK_SUPERUSE_SUPERUSER_USER_ACC;

alter table USER_ACCOUNT 
   drop foreign key FK_USER_ACC_PERSON_HA_PERSON;

alter table USER_ACCOUNT 
   drop foreign key FK_USER_ACC_CREATED_BY_USER;

alter table USER_ACCOUNT 
   drop foreign key FK_USER_ACC_MODIFIED_BY_USER;

alter table USER_SESSION 
   drop foreign key FK_USER_SES_USER_HAS__USER_ACC;


alter table ADMINISTRATIVE_CERTIFICATE 
   drop foreign key FK_ADMINIST_AD_IS_BRO_WAREHOUS;

alter table ADMINISTRATIVE_CERTIFICATE 
   drop foreign key FK_ADMINIST_AO_LEADS__ATTRIBUT;

alter table ADMINISTRATIVE_CERTIFICATE 
   drop foreign key FK_ADMINIST_AC_IS_LIN_RECEIPT_;

drop table if exists ADMINISTRATIVE_CERTIFICATE;


/* Removed drop table if exists AO_IS_LINKED_TO_RR; */


alter table ASSET 
   drop foreign key FK_ASSET_ASSET_IS__ASSET_MO;

alter table ASSET 
   drop foreign key FK_ASSET_ASSET_IS__ATTRIBUT;

alter table ASSET 
   drop foreign key FK_ASSET_ASSET_IS__DESTRUCT;

drop table if exists ASSET;

drop table if exists ASSET_ATTRIBUTE_DEFINITION;


alter table ASSET_ATTRIBUTE_VALUE 
   drop foreign key FK_ASSET_AT_ASSET_ATT_ASSET_AT;

alter table ASSET_ATTRIBUTE_VALUE 
   drop foreign key FK_ASSET_AT_ASSET_ATT_ASSET;

drop table if exists ASSET_ATTRIBUTE_VALUE;

drop table if exists ASSET_BRAND;


alter table ASSET_CONDITION_HISTORY 
   drop foreign key FK_ASSET_CO_ASSET_HAS_ASSET;

alter table ASSET_CONDITION_HISTORY 
   drop foreign key FK_ASSET_CO_ASSET_CON_PHYSICAL;

drop table if exists ASSET_CONDITION_HISTORY;


alter table ASSET_IS_ASSIGNED_TO_PERSON 
   drop foreign key FK_ASSET_IS_ASSET_IS__PERSON;

alter table ASSET_IS_ASSIGNED_TO_PERSON 
   drop foreign key FK_AIATP_ASSET;

alter table ASSET_IS_ASSIGNED_TO_PERSON 
   drop foreign key FK_ASSET_IS_ASSET_IS__PERSON;

drop table if exists ASSET_IS_ASSIGNED_TO_PERSON;


alter table ASSET_IS_COMPOSED_OF_CONSUMABLE_HISTORY 
   drop foreign key FK_ASSET_IS_ASSET_IS__CONSUMAB;

alter table ASSET_IS_COMPOSED_OF_CONSUMABLE_HISTORY 
   drop foreign key FK_AICOC_ASSET;

alter table ASSET_IS_COMPOSED_OF_CONSUMABLE_HISTORY 
   drop foreign key FK_AICOC_MAINTENANCE_STEP;

drop table if exists ASSET_IS_COMPOSED_OF_CONSUMABLE_HISTORY;


alter table ASSET_IS_COMPOSED_OF_STOCK_ITEMS_HISTORY 
   drop foreign key FK_ASSET_IS_ASSET_IS__STOCK_IT;

alter table ASSET_IS_COMPOSED_OF_STOCK_ITEMS_HISTORY 
   drop foreign key FK_AICOSI_ASSET;

alter table ASSET_IS_COMPOSED_OF_STOCK_ITEMS_HISTORY 
   drop foreign key FK_AICOSI_MAINTENANCE_STEP;

drop table if exists ASSET_IS_COMPOSED_OF_STOCK_ITEMS_HISTORY;


alter table ASSET_MODEL 
   drop foreign key FK_ASSET_MO_ASSET_MOD_ASSET_BR;

alter table ASSET_MODEL 
   drop foreign key FK_ASSET_MO_ASSET_TYP_ASSET_TY;

drop table if exists ASSET_MODEL;


alter table ASSET_MODEL_ATTRIBUTE_VALUE 
   drop foreign key FK_ASSET_MO_ASSET_MOD_ASSET_MO;

alter table ASSET_MODEL_ATTRIBUTE_VALUE 
   drop foreign key FK_ASSET_MO_ASSET_MOD_ASSET_AT;

drop table if exists ASSET_MODEL_ATTRIBUTE_VALUE;


alter table ASSET_MOVEMENT 
   drop foreign key FK_ASSET_MO_ASSET_MOV_ASSET;

alter table ASSET_MOVEMENT 
   drop foreign key FK_ASSET_MO_ASSET_MOV_ROOM_SOURCE;

alter table ASSET_MOVEMENT 
   drop foreign key FK_ASSET_MO_ASSET_MOV_ROOM_DEST;

alter table ASSET_MOVEMENT 
   drop foreign key FK_ASSET_MO_ASSET_MOV_MAINTENA;

alter table ASSET_MOVEMENT 
   drop foreign key FK_ASSET_MO_ASSET_MOV_EXTERNAL;

drop table if exists ASSET_MOVEMENT;

drop table if exists ASSET_TYPE;


alter table ASSET_TYPE_ATTRIBUTE 
   drop foreign key FK_ASSET_TY_ASSET_TYP_ASSET_AT;

alter table ASSET_TYPE_ATTRIBUTE 
   drop foreign key FK_ASSET_TY_ASSET_TYP_ASSET_TY;

drop table if exists ASSET_TYPE_ATTRIBUTE;


alter table ATTRIBUTION_ORDER 
   drop foreign key FK_ATTRIBUT_SHIPMENT__WAREHOUS;

drop table if exists ATTRIBUTION_ORDER;


alter table AUTHENTICATION_LOG 
   drop foreign key FK_AUTHENTI_USER_HAS__USER_ACC;

drop table if exists AUTHENTICATION_LOG;


alter table BON_DE_COMMANDE 
   drop foreign key FK_BON_DE_C_BDC_IS_MA_SUPPLIER;

drop table if exists BON_DE_COMMANDE;


alter table BON_DE_LIVRAISON 
   drop foreign key FK_BON_DE_L_BON_DE_CO_BON_DE_C;

drop table if exists BON_DE_LIVRAISON;


alter table BON_DE_RESTE 
   drop foreign key FK_BON_DE_R_BDC_HAS_B_BON_DE_C;

drop table if exists BON_DE_RESTE;

drop table if exists BROKEN_ITEM_REPORT;


alter table COMPANY_ASSET_REQUEST 
   drop foreign key FK_COMPANY__AO_LEADS__ATTRIBUT;

drop table if exists COMPANY_ASSET_REQUEST;


/* Removed drop table if exists COMPANY_ASSET_REQUEST_IS_LINKED_TO_RECEIPT_REPORT; */


alter table CONSUMABLE 
   drop foreign key FK_CONSUMAB_CONSUMABL_CONSUMAB;

alter table CONSUMABLE 
   drop foreign key FK_CONSUMAB_CONSUMABL_DESTRUCT;

drop table if exists CONSUMABLE;

drop table if exists CONSUMABLE_ATTRIBUTE_DEFINITION;


alter table CONSUMABLE_ATTRIBUTE_VALUE 
   drop foreign key FK_CONSUMAB_CONSUMABL_CONSUMAB;

alter table CONSUMABLE_ATTRIBUTE_VALUE 
   drop foreign key FK_CONSUMAB_CONSUMABL_CONSUMAB;

drop table if exists CONSUMABLE_ATTRIBUTE_VALUE;

drop table if exists CONSUMABLE_BRAND;


alter table CONSUMABLE_CONDITION_HISTORY 
   drop foreign key FK_CONSUMAB_ASSOCIATI_CONSUMAB;

drop table if exists CONSUMABLE_CONDITION_HISTORY;


alter table CONSUMABLE_CONDITION_HISTORY_HAS_PHYSICAL_CONDITION 
   drop foreign key FK_CONSUMAB_CONSUMABL_CONSUMAB;

alter table CONSUMABLE_CONDITION_HISTORY_HAS_PHYSICAL_CONDITION 
   drop foreign key FK_CONSUMAB_CONSUMABL_PHYSICAL;

drop table if exists CONSUMABLE_CONDITION_HISTORY_HAS_PHYSICAL_CONDITION;


alter table CONSUMABLE_IS_ASSIGNED_TO_PERSON 
   drop foreign key FK_CONSUMAB_CONSUMABL_PERSON_ASSIGNED;

alter table CONSUMABLE_IS_ASSIGNED_TO_PERSON 
   drop foreign key FK_CONSUMAB_CONSUMABL_CONSUMAB;

alter table CONSUMABLE_IS_ASSIGNED_TO_PERSON 
   drop foreign key FK_CONSUMAB_CONSUMABL_PERSON_ASSIGNER;

drop table if exists CONSUMABLE_IS_ASSIGNED_TO_PERSON;


alter table CONSUMABLE_IS_USED_IN_STOCK_ITEM_HISTORY 
   drop foreign key FK_CONSUMAB_CONSUMABL_CONSUMAB;

alter table CONSUMABLE_IS_USED_IN_STOCK_ITEM_HISTORY 
   drop foreign key FK_CONSUMAB_CONSUMABL_STOCK_IT;

alter table CONSUMABLE_IS_USED_IN_STOCK_ITEM_HISTORY 
   drop foreign key FK_CONSUMAB_CONSUMABL_MAINTENA;

drop table if exists CONSUMABLE_IS_USED_IN_STOCK_ITEM_HISTORY;


alter table CONSUMABLE_MODEL 
   drop foreign key FK_CONSUMAB_CONSUMABL_CONSUMAB;

alter table CONSUMABLE_MODEL 
   drop foreign key FK_CONSUMAB_CONSUMABL_CONSUMAB;

drop table if exists CONSUMABLE_MODEL;


alter table CONSUMABLE_MODEL_ATTRIBUTE_VALUE 
   drop foreign key FK_CONSUMAB_CONSUMABL_CONSUMAB;

alter table CONSUMABLE_MODEL_ATTRIBUTE_VALUE 
   drop foreign key FK_CONSUMAB_CONSUMABL_CONSUMAB;

drop table if exists CONSUMABLE_MODEL_ATTRIBUTE_VALUE;


alter table CONSUMABLE_MODEL_IS_FOUND_IN_BDC 
   drop foreign key FK_CONSUMAB_CONSUMABL_CONSUMAB;

alter table CONSUMABLE_MODEL_IS_FOUND_IN_BDC 
   drop foreign key FK_CONSUMAB_CONSUMABL_BON_DE_C;

drop table if exists CONSUMABLE_MODEL_IS_FOUND_IN_BDC;


alter table CONSUMABLE_MOVEMENT 
   drop foreign key FK_CONSUMAB_CONSUMABL_CONSUMAB;

alter table CONSUMABLE_MOVEMENT 
   drop foreign key FK_CONSUMAB_CONSUMABL_ROOM_DEST;

alter table CONSUMABLE_MOVEMENT 
   drop foreign key FK_CONSUMAB_CONSUMABL_ROOM_SOURCE;

alter table CONSUMABLE_MOVEMENT 
   drop foreign key FK_CONSUMAB_CONSUMABL_MAINTENA;

alter table CONSUMABLE_MOVEMENT 
   drop foreign key FK_CONSUMAB_CONSUMABL_EXTERNAL;

drop table if exists CONSUMABLE_MOVEMENT;

drop table if exists CONSUMABLE_TYPE;


alter table CONSUMABLE_TYPE_ATTRIBUTE 
   drop foreign key FK_CONSUMAB_CONSUMABL_CONSUMAB;

alter table CONSUMABLE_TYPE_ATTRIBUTE 
   drop foreign key FK_CONSUMAB_CONSUMABL_CONSUMAB;

drop table if exists CONSUMABLE_TYPE_ATTRIBUTE;


alter table C_IS_COMPATIBLE_WITH_A 
   drop foreign key FK_C_IS_COM_C_IS_COMP_CONSUMAB;

alter table C_IS_COMPATIBLE_WITH_A 
   drop foreign key FK_C_IS_COM_C_IS_COMP_ASSET_MO;

drop table if exists C_IS_COMPATIBLE_WITH_A;


alter table C_IS_COMPATIBLE_WITH_SI 
   drop foreign key FK_C_IS_COM_C_IS_COMP_CONSUMAB;

alter table C_IS_COMPATIBLE_WITH_SI 
   drop foreign key FK_C_IS_COM_C_IS_COMP_STOCK_IT;

drop table if exists C_IS_COMPATIBLE_WITH_SI;

drop table if exists DESTRUCTION_CERTIFICATE;


alter table EXTERNAL_MAINTENANCE 
   drop foreign key FK_EXTERNAL_MAINTENAN_MAINTENA;

drop table if exists EXTERNAL_MAINTENANCE;


alter table EXTERNAL_MAINTENANCE_DOCUMENT 
   drop foreign key FK_EXTERNAL_EXTERNAL__EXTERNAL;

drop table if exists EXTERNAL_MAINTENANCE_DOCUMENT;

drop table if exists EXTERNAL_MAINTENANCE_PROVIDER;


alter table EXTERNAL_MAINTENANCE_STEP 
   drop foreign key FK_EXTERNAL_EXTERNAL__EXTERNAL;

alter table EXTERNAL_MAINTENANCE_STEP 
   drop foreign key FK_EXTERNAL_EXTERNAL__EXTERNAL;

alter table EXTERNAL_MAINTENANCE_STEP 
   drop foreign key FK_EXTERNAL_EMS_IS_A__EXTERNAL;

drop table if exists EXTERNAL_MAINTENANCE_STEP;

drop table if exists EXTERNAL_MAINTENANCE_TYPICAL_STEP;


alter table FACTURE 
   drop foreign key FK_FACTURE_BON_DE_LI_BON_DE_L;

drop table if exists FACTURE;


alter table MAINTENANCE 
   drop foreign key FK_MAINTENA_ASSET_IS__ASSET;

alter table MAINTENANCE 
   drop foreign key FK_MAINTENA_PERSON_IS_PERSON;

alter table MAINTENANCE 
   drop foreign key FK_MAINTENA_MAINTENAN_PERSON;

alter table MAINTENANCE 
   drop foreign key FK_MAINTENA_PERSON_AS_PERSON;

drop table if exists MAINTENANCE;


alter table MAINTENANCE_INSPECTION_LEADS_TO_BROKEN_ITEM_REPORT 
   drop foreign key FK_MAINTENA_MAINTENAN_MAINTENA;

alter table MAINTENANCE_INSPECTION_LEADS_TO_BROKEN_ITEM_REPORT 
   drop foreign key FK_MAINTENA_MAINTENAN_BROKEN_I;

drop table if exists MAINTENANCE_INSPECTION_LEADS_TO_BROKEN_ITEM_REPORT;


alter table MAINTENANCE_STEP 
   drop foreign key FK_MAINTENA_MAINTENAN_MAINTENA;

alter table MAINTENANCE_STEP 
   drop foreign key FK_MAINTENA_MAINTENAN_MAINTENA;

alter table MAINTENANCE_STEP 
   drop foreign key FK_MAINTENA_PERSON_IS_PERSON;

alter table MAINTENANCE_STEP 
   drop foreign key FK_MAINTENA_ASSET_CON_ASSET_CO;

alter table MAINTENANCE_STEP 
   drop foreign key FK_MAINTENA_STOCK_ITE_STOCK_IT;

alter table MAINTENANCE_STEP 
   drop foreign key FK_MAINTENA_CONSUMABL_CONSUMAB;

drop table if exists MAINTENANCE_STEP;

drop table if exists MAINTENANCE_TYPICAL_STEP;

drop table if exists ORGANIZATIONAL_STRUCTURE;


alter table ORGANIZATIONAL_STRUCTURE_RELATION 
   drop foreign key FK_ORGANIZA_ORGANIZAT_ORGANIZA_PARENT;

alter table ORGANIZATIONAL_STRUCTURE_RELATION 
   drop foreign key FK_ORGANIZA_ORGANIZAT_ORGANIZA_CHILD;

drop table if exists ORGANIZATIONAL_STRUCTURE_RELATION;

drop table if exists PERSON;


alter table PERSON_ASSIGNMENT 
   drop foreign key FK_PERSON_A_PERSON_IS_POSITION;

alter table PERSON_ASSIGNMENT 
   drop foreign key FK_PERSON_A_PERSON_HA_PERSON;

drop table if exists PERSON_ASSIGNMENT;


alter table PERSON_REPORTS_PROBLEM_ON_ASSET 
   drop foreign key FK_PERSON_R_PERSON_RE_ASSET;

alter table PERSON_REPORTS_PROBLEM_ON_ASSET 
   drop foreign key FK_PERSON_R_PERSON_RE_PERSON;

drop table if exists PERSON_REPORTS_PROBLEM_ON_ASSET;


alter table PERSON_REPORTS_PROBLEM_ON_CONSUMABLE 
   drop foreign key FK_PERSON_R_PERSON_RE_PERSON;

alter table PERSON_REPORTS_PROBLEM_ON_CONSUMABLE 
   drop foreign key FK_PERSON_R_PERSON_RE_CONSUMAB;

drop table if exists PERSON_REPORTS_PROBLEM_ON_CONSUMABLE;


alter table PERSON_REPORTS_PROBLEM_ON_STOCK_ITEM 
   drop foreign key FK_PERSON_R_PERSON_RE_PERSON;

alter table PERSON_REPORTS_PROBLEM_ON_STOCK_ITEM 
   drop foreign key FK_PERSON_R_PERSON_RE_STOCK_IT;

drop table if exists PERSON_REPORTS_PROBLEM_ON_STOCK_ITEM;

drop table if exists PHYSICAL_CONDITION;

drop table if exists POSITION;


alter table POSITION_ROLE_MAPPING 
   drop foreign key FK_POSITION_POSITION__ROLE;

alter table POSITION_ROLE_MAPPING 
   drop foreign key FK_POSITION_POSITION__PERSON;

drop table if exists PERSON_ROLE_MAPPING;

drop table if exists RECEIPT_REPORT;

drop table if exists ROLE;

drop table if exists ROOM;


alter table ROOM_BELONGS_TO_ORGANIZATIONAL_STRUCTURE 
   drop foreign key FK_ROOM_BEL_ROOM_BELO_ORGANIZA;

alter table ROOM_BELONGS_TO_ORGANIZATIONAL_STRUCTURE 
   drop foreign key FK_ROOM_BEL_ROOM_BELO_ROOM;

drop table if exists ROOM_BELONGS_TO_ORGANIZATIONAL_STRUCTURE;


alter table STOCK_ITEM 
   drop foreign key FK_STOCK_IT_STOCK_ITE_MAINTENA;

alter table STOCK_ITEM 
   drop foreign key FK_STOCK_IT_STOCK_ITE_STOCK_IT;

alter table STOCK_ITEM 
   drop foreign key FK_STOCK_IT_STOCK_ITE_DESTRUCT;

drop table if exists STOCK_ITEM;

drop table if exists STOCK_ITEM_ATTRIBUTE_DEFINITION;


alter table STOCK_ITEM_ATTRIBUTE_VALUE 
   drop foreign key FK_STOCK_IT_STOCK_ITE_STOCK_IT;

alter table STOCK_ITEM_ATTRIBUTE_VALUE 
   drop foreign key FK_STOCK_IT_STOCK_ITE_STOCK_IT;

drop table if exists STOCK_ITEM_ATTRIBUTE_VALUE;

drop table if exists STOCK_ITEM_BRAND;


alter table STOCK_ITEM_CONDITION_HISTORY 
   drop foreign key FK_STOCK_IT_STOCK_ITE_STOCK_IT;

alter table STOCK_ITEM_CONDITION_HISTORY 
   drop foreign key FK_STOCK_IT_STOCK_ITE_PHYSICAL;

drop table if exists STOCK_ITEM_CONDITION_HISTORY;


alter table STOCK_ITEM_IS_ASSIGNED_TO_PERSON 
   drop foreign key FK_STOCK_IT_STOCK_ITE_STOCK_IT;

alter table STOCK_ITEM_IS_ASSIGNED_TO_PERSON 
   drop foreign key FK_STOCK_IT_STOCK_ITE_PERSON_ASSIGNED;

alter table STOCK_ITEM_IS_ASSIGNED_TO_PERSON 
   drop foreign key FK_STOCK_IT_STOCK_ITE_PERSON_ASSIGNER;

drop table if exists STOCK_ITEM_IS_ASSIGNED_TO_PERSON;


alter table STOCK_ITEM_IS_COMPATIBLE_WITH_ASSET 
   drop foreign key FK_STOCK_IT_STOCK_ITE_STOCK_IT;

alter table STOCK_ITEM_IS_COMPATIBLE_WITH_ASSET 
   drop foreign key FK_STOCK_IT_STOCK_ITE_ASSET_MO;

drop table if exists STOCK_ITEM_IS_COMPATIBLE_WITH_ASSET;


alter table STOCK_ITEM_MODEL 
   drop foreign key FK_STOCK_IT_STOCK_ITE_STOCK_IT;

alter table STOCK_ITEM_MODEL 
   drop foreign key FK_STOCK_IT_STOCK_ITE_STOCK_IT;

drop table if exists STOCK_ITEM_MODEL;


alter table STOCK_ITEM_MODEL_ATTRIBUTE_VALUE 
   drop foreign key FK_STOCK_IT_STOCK_ITE_STOCK_IT;

alter table STOCK_ITEM_MODEL_ATTRIBUTE_VALUE 
   drop foreign key FK_STOCK_IT_STOCK_ITE_STOCK_IT;

drop table if exists STOCK_ITEM_MODEL_ATTRIBUTE_VALUE;


alter table STOCK_ITEM_MODEL_IS_FOUND_IN_BDC 
   drop foreign key FK_STOCK_IT_STOCK_ITE_STOCK_IT;

alter table STOCK_ITEM_MODEL_IS_FOUND_IN_BDC 
   drop foreign key FK_STOCK_IT_STOCK_ITE_BON_DE_C;

drop table if exists STOCK_ITEM_MODEL_IS_FOUND_IN_BDC;


alter table STOCK_ITEM_MOVEMENT 
   drop foreign key FK_STOCK_IT_STOCK_ITE_STOCK_IT;

alter table STOCK_ITEM_MOVEMENT 
   drop foreign key FK_STOCK_IT_STOCK_ITE_ROOM;

alter table STOCK_ITEM_MOVEMENT 
   drop foreign key FK_STOCK_IT_STOCK_ITE_ROOM;

alter table STOCK_ITEM_MOVEMENT 
   drop foreign key FK_STOCK_IT_STOCK_ITE_MAINTENA;

alter table STOCK_ITEM_MOVEMENT 
   drop foreign key FK_STOCK_IT_STOCK_ITE_EXTERNAL;

drop table if exists STOCK_ITEM_MOVEMENT;

drop table if exists STOCK_ITEM_TYPE;


alter table STOCK_ITEM_TYPE_ATTRIBUTE 
   drop foreign key FK_STOCK_IT_STOCK_ITE_STOCK_IT;

alter table STOCK_ITEM_TYPE_ATTRIBUTE 
   drop foreign key FK_STOCK_IT_STOCK_ITE_STOCK_IT;

drop table if exists STOCK_ITEM_TYPE_ATTRIBUTE;


/* Removed SUPERUSER_CREATES_ACCOUNT - fields now in USER_ACCOUNT */


/* Removed SUPERUSER_MODIFIES_ACCOUNT - fields now in USER_ACCOUNT */

drop table if exists SUPPLIER;


alter table USER_ACCOUNT 
   drop foreign key FK_USER_ACC_PERSON_HA_PERSON;

drop table if exists USER_ACCOUNT;


alter table USER_SESSION 
   drop foreign key FK_USER_SES_USER_HAS__USER_ACC;

drop table if exists USER_SESSION;

drop table if exists WAREHOUSE;

/*==============================================================*/
/* Table: ADMINISTRATIVE_CERTIFICATE                            */
/*==============================================================*/
create table ADMINISTRATIVE_CERTIFICATE
(
   ADMINISTRATIVE_CERTIFICATE_ID int not null  comment '',
   WAREHOUSE_ID         int not null  comment '',
   ATTRIBUTION_ORDER_ID int not null  comment '',
   RECEIPT_REPORT_ID    int not null  comment '',
   INTERESTED_ORGANIZATION varchar(60)  comment '',
   OPERATION            varchar(20)  comment 'Action" can be "entry", "exit" or "transfer',
   FORMAT               varchar(8)  comment 'Among the formats is "21x27"',
   IS_SIGNED_BY_WAREHOUSE_STORAGE_MAGAZINER bool  comment '',
   IS_SIGNED_BY_WAREHOUSE_STORAGE_ACCOUNTANT bool  comment '',
   IS_SIGNED_BY_WAREHOUSE_STORAGE_MARKETER bool  comment '',
   IS_SIGNED_BY_WAREHOUSE_IT_CHIEF bool  comment '',
   IS_SIGNED_BY_WAREHOUSE_LEADER bool  comment '',
   DIGITAL_COPY         blob  comment '',
   primary key (ADMINISTRATIVE_CERTIFICATE_ID)
);

/*==============================================================*/
/* Table: AO_IS_LINKED_TO_RR                                    */
/*==============================================================*/
/* Removed AO_IS_LINKED_TO_RR */

/*==============================================================*/
/* Table: ASSET                                                 */
/*==============================================================*/
create table ASSET
(
   ASSET_ID             int not null  comment '',
   ASSET_MODEL_ID       int not null  comment '',
   ATTRIBUTION_ORDER_ID int not null  comment '',
   DESTRUCTION_CERTIFICATE_ID int not null  comment '',
   ASSET_SERIAL_NUMBER  varchar(48)  comment '',
   ASSET_FABRICATION_DATETIME datetime  comment '',
   ASSET_INVENTORY_NUMBER varchar(6)  comment '',
   ASSET_SERVICE_TAG    varchar(24)  comment '',
   ASSET_NAME           varchar(48)  comment '',
   ASSET_NAME_IN_THE_ADMINISTRATIVE_CERTIFICATE varchar(48)  comment '',
   ASSET_ARRIVAL_DATETIME datetime  comment '',
   ASSET_STATUS         varchar(30)  comment '',
   primary key (ASSET_ID)
);

/*==============================================================*/
/* Table: ASSET_ATTRIBUTE_DEFINITION                            */
/*==============================================================*/
create table ASSET_ATTRIBUTE_DEFINITION
(
   ASSET_ATTRIBUTE_DEFINITION_ID int not null  comment '',
   DATA_TYPE            varchar(18)  comment '',
   UNIT                 varchar(24)  comment '',
   DESCRIPTION          varchar(256)  comment '',
   primary key (ASSET_ATTRIBUTE_DEFINITION_ID)
);

/*==============================================================*/
/* Table: ASSET_ATTRIBUTE_VALUE                                 */
/*==============================================================*/
create table ASSET_ATTRIBUTE_VALUE
(
   ASSET_ATTRIBUTE_DEFINITION_ID int not null  comment '',
   ASSET_ID             int not null  comment '',
   VALUE_STRING         varchar(1024)  comment '',
   VALUE_BOOL           bool  comment '',
   VALUE_DATE           date  comment '',
   VALUE_NUMBER         decimal(18,6)  comment '',
   primary key (ASSET_ATTRIBUTE_DEFINITION_ID, ASSET_ID)
);

/*==============================================================*/
/* Table: ASSET_BRAND                                           */
/*==============================================================*/
create table ASSET_BRAND
(
   ASSET_BRAND_ID       int not null  comment '',
   BRAND_NAME           varchar(48)  comment '',
   BRAND_CODE           varchar(16)  comment '',
   IS_ACTIVE            bool  comment '',
   primary key (ASSET_BRAND_ID)
);

/*==============================================================*/
/* Table: ASSET_CONDITION_HISTORY                               */
/*==============================================================*/
create table ASSET_CONDITION_HISTORY
(
   ASSET_CONDITION_HISTORY_ID int not null  comment '',
   ASSET_ID             int not null  comment '',
   CONDITION_ID         int not null  comment '',
   NOTES                varchar(256)  comment '',
   COSMETIC_ISSUES      varchar(128)  comment '',
   FUNCTIONAL_ISSUES    varchar(128)  comment '',
   RECOMMENDATION       varchar(24)  comment '',
   CREATED_AT           datetime  comment '',
   primary key (ASSET_CONDITION_HISTORY_ID)
);

/*==============================================================*/
/* Table: ASSET_IS_ASSIGNED_TO_PERSON                           */
/*==============================================================*/
create table ASSET_IS_ASSIGNED_TO_PERSON
(
   PERSON_ID            int not null  comment '',
   ASSET_ID             int not null  comment '',
   ASSIGNED_BY_PERSON_ID int not null  comment '',
   ASSIGNMENT_ID        int not null  comment '',
   START_DATETIME       datetime not null  comment '',
   END_DATETIME         datetime not null  comment '',
   CONDITION_ON_ASSIGNMENT varchar(48) not null  comment '',
   IS_ACTIVE            bool not null  comment '',
   primary key (ASSIGNMENT_ID)
);

alter table ASSET_IS_ASSIGNED_TO_PERSON comment 'The first person is the one to whom the asset is assigned, a';

/*==============================================================*/
/* Table: ASSET_IS_COMPOSED_OF_CONSUMABLE_HISTORY               */
/*==============================================================*/
create table ASSET_IS_COMPOSED_OF_CONSUMABLE_HISTORY
(
   CONSUMABLE_ID        int not null  comment '',
   ASSET_ID             int not null  comment '',
   MAINTENANCE_STEP_ID  int not null  comment '',
   START_DATETIME       datetime  comment '',
   END_DATETIME         datetime  comment '',
   primary key (CONSUMABLE_ID, ASSET_ID, MAINTENANCE_STEP_ID)
);

/*==============================================================*/
/* Table: ASSET_IS_COMPOSED_OF_STOCK_ITEMS_HISTORY              */
/*==============================================================*/
create table ASSET_IS_COMPOSED_OF_STOCK_ITEMS_HISTORY
(
   STOCK_ITEM_ID        int not null  comment '',
   ASSET_ID             int not null  comment '',
   MAINTENANCE_STEP_ID  int not null  comment '',
   START_DATETIME       datetime  comment '',
   END_DATETIME         datetime  comment '',
   primary key (STOCK_ITEM_ID, ASSET_ID, MAINTENANCE_STEP_ID)
);

/*==============================================================*/
/* Table: ASSET_MODEL                                           */
/*==============================================================*/
create table ASSET_MODEL
(
   ASSET_MODEL_ID       int not null  comment '',
   ASSET_BRAND_ID       int not null  comment '',
   ASSET_TYPE_ID        int not null  comment '',
   MODEL_NAME           varchar(48)  comment '',
   MODEL_CODE           varchar(16)  comment '',
   RELEASE_YEAR         int  comment '',
   DISCONTINUED_YEAR    int  comment '',
   IS_ACTIVE            bool  comment '',
   NOTES                varchar(256)  comment '',
   WARRANTY_EXPIRY_IN_MONTHS int  comment '',
   primary key (ASSET_MODEL_ID)
);

/*==============================================================*/
/* Table: ASSET_MODEL_ATTRIBUTE_VALUE                           */
/*==============================================================*/
create table ASSET_MODEL_ATTRIBUTE_VALUE
(
   ASSET_MODEL_ID       int not null  comment '',
   ASSET_ATTRIBUTE_DEFINITION_ID int not null  comment '',
   VALUE_BOOL           bool  comment '',
   VALUE_STRING         varchar(1024)  comment '',
   VALUE_NUMBER         decimal(18,6)  comment '',
   VALUE_DATE           date  comment '',
   primary key (ASSET_MODEL_ID, ASSET_ATTRIBUTE_DEFINITION_ID)
);

/*==============================================================*/
/* Table: ASSET_MOVEMENT                                        */
/*==============================================================*/
create table ASSET_MOVEMENT
(
   ASSET_MOVEMENT_ID    int not null  comment '',
   ASSET_ID             int not null  comment '',
   SOURCE_ROOM_ID       int not null  comment '',
   DESTINATION_ROOM_ID  int not null  comment '',
   MAINTENANCE_STEP_ID  int  comment '',
   EXTERNAL_MAINTENANCE_STEP_ID int  comment '',
   MOVEMENT_REASON      varchar(128) not null  comment '',
   MOVEMENT_DATETIME    datetime not null  comment '',
   primary key (ASSET_MOVEMENT_ID)
);

/*==============================================================*/
/* Table: ASSET_TYPE                                            */
/*==============================================================*/
create table ASSET_TYPE
(
   ASSET_TYPE_ID        int not null  comment '',
   ASSET_TYPE_LABEL     varchar(60)  comment '',
   ASSET_TYPE_CODE      varchar(18)  comment '',
   primary key (ASSET_TYPE_ID)
);

/*==============================================================*/
/* Table: ASSET_TYPE_ATTRIBUTE                                  */
/*==============================================================*/
create table ASSET_TYPE_ATTRIBUTE
(
   ASSET_ATTRIBUTE_DEFINITION_ID int not null  comment '',
   ASSET_TYPE_ID        int not null  comment '',
   IS_MANDATORY         bool  comment '',
   DEFAULT_VALUE        varchar(255)  comment '',
   primary key (ASSET_ATTRIBUTE_DEFINITION_ID, ASSET_TYPE_ID)
);

/*==============================================================*/
/* Table: ATTRIBUTION_ORDER                                     */
/*==============================================================*/
create table ATTRIBUTION_ORDER
(
   ATTRIBUTION_ORDER_ID int not null  comment '',
   WAREHOUSE_ID         int not null  comment '',
   ATTRIBUTION_ORDER_FULL_CODE varchar(48)  comment '',
   ATTRIBUTION_ORDER_DATE date  comment '',
   IS_SIGNED_BY_CENTRAL_CHIEF bool  comment '',
   ATTRIBUTION_ORDER_BARCODE varchar(24)  comment '',
   primary key (ATTRIBUTION_ORDER_ID)
);

/*==============================================================*/
/* Table: AUTHENTICATION_LOG                                    */
/*==============================================================*/
create table AUTHENTICATION_LOG
(
   LOG_ID               int not null  comment '',
   USER_ID              int not null  comment '',
   ATTEMPTED_USERNAME   varchar(50)  comment '',
   /* FIX: Merged multiple strings into one single comment string */
   EVENT_TYPE           varchar(24)  comment 'LOGIN_SUCCESS, LOGIN_FAILURE, LOGOUT, PWD_CHANGE, ACCOUNT_LOCK',
   IP_ADDRESS           varchar(45)  comment '',
   EVENT_TIMESTAMP      timestamp  comment '',
   FAILURE_REASON       varchar(60)  comment 'e.g., Invalid Password, User Disabled',
   primary key (LOG_ID)
);

/*==============================================================*/
/* Table: BON_DE_COMMANDE                                       */
/*==============================================================*/
create table BON_DE_COMMANDE
(
   BON_DE_COMMANDE_ID   int not null  comment '',
   SUPPLIER_ID          int not null  comment '',
   DIGITAL_COPY         blob  comment '',
   IS_SIGNED_BY_FINANCE bool  comment '',
   BON_DE_COMMANDE_CODE varchar(10)  comment '',
   primary key (BON_DE_COMMANDE_ID)
);

/*==============================================================*/
/* Table: BON_DE_LIVRAISON                                      */
/*==============================================================*/
create table BON_DE_LIVRAISON
(
   BON_DE_LIVRAISON_ID  int not null  comment '',
   BON_DE_COMMANDE_ID   int not null  comment '',
   BON_DE_LIVRAISON_DATE date  comment '',
   DIGITAL_COPY         blob  comment '',
   BON_DE_LIVRAISON_CODE varchar(10)  comment '',
   primary key (BON_DE_LIVRAISON_ID)
);

/*==============================================================*/
/* Table: BON_DE_RESTE                                          */
/*==============================================================*/
create table BON_DE_RESTE
(
   BON_DE_RESTE_ID      int not null  comment '',
   BON_DE_COMMANDE_ID   int not null  comment '',
   BON_DE_RESTE_DATE    date  comment '',
   DIGITAL_COPY         blob  comment '',
   primary key (BON_DE_RESTE_ID)
);

/*==============================================================*/
/* Table: BROKEN_ITEM_REPORT                                    */
/*==============================================================*/
create table BROKEN_ITEM_REPORT
(
   BROKEN_ITEM_REPORT_ID int not null  comment '',
   DIGITAL_COPY         blob  comment '',
   primary key (BROKEN_ITEM_REPORT_ID)
);

alter table BROKEN_ITEM_REPORT comment 'Equivalent of C5';

/*==============================================================*/
/* Table: COMPANY_ASSET_REQUEST                                 */
/*==============================================================*/
create table COMPANY_ASSET_REQUEST
(
   COMPANY_ASSET_REQUEST_ID int not null  comment '',
   ATTRIBUTION_ORDER_ID int not null  comment '',
   IS_SIGNED_BY_COMPANY bool  comment '',
   ADMINISTRATIVE_SERIAL_NUMBER varchar(18)  comment '',
   TITLE_OF_DEMAND      varchar(24)  comment '',
   ORGANIZATION_BODY_DESIGNATION   varchar(60)  comment '',
   REGISTER_NUMBER_OR_BOOK_JOURNAL_OF_CORPSE varchar(60)  comment '',
   REGISTER_NUMBER_OR_BOOK_JOURNAL_OF_ESTABLISHMENT varchar(60)  comment '',
   IS_SIGNED_BY_COMPANY_LEADER bool  comment '',
   IS_SIGNED_BY_REGIONAL_PROVIDER bool  comment '',
   IS_SIGNED_BY_COMPANY_REPRESENTATIVE bool  comment '',
   DIGITAL_COPY         blob  comment '',
   primary key (COMPANY_ASSET_REQUEST_ID)
);

alter table COMPANY_ASSET_REQUEST comment 'Demande du mat�riel';

/*==============================================================*/
/* Table: COMPANY_ASSET_REQUEST_IS_LINKED_TO_RECEIPT_REPORT     */
/*==============================================================*/
/* Removed COMPANY_ASSET_REQUEST_IS_LINKED_TO_RECEIPT_REPORT */

/*==============================================================*/
/* Table: CONSUMABLE                                            */
/*==============================================================*/
create table CONSUMABLE
(
   CONSUMABLE_ID        int not null  comment '',
   CONSUMABLE_MODEL_ID  int not null  comment '',
   DESTRUCTION_CERTIFICATE_ID int not null  comment '',
   CONSUMABLE_NAME      varchar(48)  comment '',
   CONSUMABLE_SERIAL_NUMBER varchar(48)  comment '',
   CONSUMABLE_FABRICATION_DATETIME datetime  comment '',
   CONSUMABLE_INVENTORY_NUMBER varchar(6)  comment '',
   CONSUMABLE_SERVICE_TAG varchar(48)  comment '',
   CONSUMABLE_NAME_IN_ADMINISTRATIVE_CERTIFICATE varchar(48)  comment '',
   CONSUMABLE_ARRIVAL_DATETIME datetime  comment '',
   CONSUMABLE_STATUS    varchar(30)  comment '',
   primary key (CONSUMABLE_ID)
);

/*==============================================================*/
/* Table: CONSUMABLE_ATTRIBUTE_DEFINITION                       */
/*==============================================================*/
create table CONSUMABLE_ATTRIBUTE_DEFINITION
(
   CONSUMABLE_ATTRIBUTE_DEFINITION_ID int not null  comment '',
   CONSUMABLE_TYPE_CODE varchar(18)  comment '',
   DATA_TYPE            varchar(18)  comment '',
   UNIT                 varchar(24)  comment '',
   DESCRIPTION          varchar(256)  comment '',
   primary key (CONSUMABLE_ATTRIBUTE_DEFINITION_ID)
);

/*==============================================================*/
/* Table: CONSUMABLE_ATTRIBUTE_VALUE                            */
/*==============================================================*/
create table CONSUMABLE_ATTRIBUTE_VALUE
(
   CONSUMABLE_ID        int not null  comment '',
   CONSUMABLE_ATTRIBUTE_DEFINITION_ID int not null  comment '',
   VALUE_STRING         varchar(1024)  comment '',
   VALUE_BOOL           bool  comment '',
   VALUE_DATE           date  comment '',
   VALUE_NUMBER         decimal(18,6)  comment '',
   primary key (CONSUMABLE_ID, CONSUMABLE_ATTRIBUTE_DEFINITION_ID)
);

/*==============================================================*/
/* Table: CONSUMABLE_BRAND                                      */
/*==============================================================*/
create table CONSUMABLE_BRAND
(
   CONSUMABLE_BRAND_ID  int not null  comment '',
   BRAND_NAME           varchar(48)  comment '',
   BRAND_CODE           varchar(16)  comment '',
   IS_ACTIVE            bool  comment '',
   primary key (CONSUMABLE_BRAND_ID)
);

/*==============================================================*/
/* Table: CONSUMABLE_CONDITION_HISTORY                          */
/*==============================================================*/
create table CONSUMABLE_CONDITION_HISTORY
(
   CONSUMABLE_CONDITION_HISTORY_ID int not null  comment '',
   CONSUMABLE_ID        int not null  comment '',
   NOTES                varchar(256)  comment '',
   COSMETIC_ISSUES      varchar(128)  comment '',
   FUNCTIONAL_ISSUES    varchar(128)  comment '',
   RECOMMENDATION       varchar(24)  comment '',
   CREATED_AT           datetime  comment '',
   primary key (CONSUMABLE_CONDITION_HISTORY_ID)
);

/*==============================================================*/
/* Table: CONSUMABLE_CONDITION_HISTORY_HAS_PHYSICAL_CONDITION   */
/*==============================================================*/
create table CONSUMABLE_CONDITION_HISTORY_HAS_PHYSICAL_CONDITION
(
   CONSUMABLE_CONDITION_HISTORY_ID int not null  comment '',
   CONDITION_ID         int not null  comment '',
   primary key (CONSUMABLE_CONDITION_HISTORY_ID, CONDITION_ID)
);

/*==============================================================*/
/* Table: CONSUMABLE_IS_ASSIGNED_TO_PERSON                      */
/*==============================================================*/
create table CONSUMABLE_IS_ASSIGNED_TO_PERSON
(
   ASSIGNMENT_ID        int not null  comment '',
   CONSUMABLE_ID        int not null  comment '',
   PERSON_ID            int not null  comment '',
   ASSIGNED_BY_PERSON_ID int not null  comment '',
   START_DATETIME       datetime not null  comment '',
   END_DATETIME         datetime not null  comment '',
   CONDITION_ON_ASSIGNMENT varchar(48) not null  comment '',
   IS_ACTIVE            bool not null  comment '',
   primary key (ASSIGNMENT_ID)
);

alter table CONSUMABLE_IS_ASSIGNED_TO_PERSON comment 'The first person is the one to whom the consumable is assign';

/*==============================================================*/
/* Table: CONSUMABLE_IS_USED_IN_STOCK_ITEM_HISTORY              */
/*==============================================================*/
create table CONSUMABLE_IS_USED_IN_STOCK_ITEM_HISTORY
(
   CONSUMABLE_ID        int not null  comment '',
   STOCK_ITEM_ID        int not null  comment '',
   MAINTENANCE_STEP_ID  int not null  comment '',
   START_DATETIME       datetime  comment '',
   END_DATETIME         datetime  comment '',
   primary key (CONSUMABLE_ID, STOCK_ITEM_ID, MAINTENANCE_STEP_ID)
);

/*==============================================================*/
/* Table: CONSUMABLE_MODEL                                      */
/*==============================================================*/
create table CONSUMABLE_MODEL
(
   CONSUMABLE_MODEL_ID  int not null  comment '',
   CONSUMABLE_TYPE_ID   int not null  comment '',
   CONSUMABLE_BRAND_ID  int not null  comment '',
   MODEL_NAME           varchar(48)  comment '',
   MODEL_CODE           varchar(16)  comment '',
   RELEASE_YEAR         int  comment '',
   DISCONTINUED_YEAR    int  comment '',
   IS_ACTIVE            bool  comment '',
   NOTES                varchar(256)  comment '',
   WARRANTY_EXPIRY_IN_MONTHS int  comment '',
   primary key (CONSUMABLE_MODEL_ID)
);

/*==============================================================*/
/* Table: CONSUMABLE_MODEL_ATTRIBUTE_VALUE                      */
/*==============================================================*/
create table CONSUMABLE_MODEL_ATTRIBUTE_VALUE
(
   CONSUMABLE_MODEL_ID  int not null  comment '',
   CONSUMABLE_ATTRIBUTE_DEFINITION_ID int not null  comment '',
   VALUE_BOOL           bool  comment '',
   VALUE_STRING         varchar(1024)  comment '',
   VALUE_NUMBER         decimal(18,6)  comment '',
   VALUE_DATE           date  comment '',
   primary key (CONSUMABLE_MODEL_ID, CONSUMABLE_ATTRIBUTE_DEFINITION_ID)
);

/*==============================================================*/
/* Table: CONSUMABLE_MODEL_IS_FOUND_IN_BDC                      */
/*==============================================================*/
create table CONSUMABLE_MODEL_IS_FOUND_IN_BDC
(
   CONSUMABLE_MODEL_ID  int not null  comment '',
   BON_DE_COMMANDE_ID   int not null  comment '',
   QUANTITY_ORDERED     int  comment '',
   QUANTITY_RECEIVED    int  comment '',
   QUANTITY_INVOICED    int  comment '',
   UNIT_PRICE           decimal(10,2)  comment '',
   primary key (CONSUMABLE_MODEL_ID, BON_DE_COMMANDE_ID)
);

/*==============================================================*/
/* Table: CONSUMABLE_MOVEMENT                                   */
/*==============================================================*/
create table CONSUMABLE_MOVEMENT
(
   CONSUMABLE_MOVEMENT_ID int not null  comment '',
   DESTINATION_ROOM_ID  int not null  comment '',
   SOURCE_ROOM_ID       int not null  comment '',
   MAINTENANCE_STEP_ID  int  comment '',
   EXTERNAL_MAINTENANCE_STEP_ID int  comment '',
   CONSUMABLE_ID        int not null  comment '',
   MOVEMENT_REASON      varchar(128) not null  comment '',
   MOVEMENT_DATETIME    datetime not null  comment '',
   primary key (CONSUMABLE_MOVEMENT_ID)
);

/*==============================================================*/
/* Table: CONSUMABLE_TYPE                                       */
/*==============================================================*/
create table CONSUMABLE_TYPE
(
   CONSUMABLE_TYPE_ID   int not null  comment '',
   CONSUMABLE_TYPE_LABEL varchar(60)  comment '',
   CONSUMABLE_TYPE_CODE varchar(18)  comment '',
   primary key (CONSUMABLE_TYPE_ID)
);

/*==============================================================*/
/* Table: CONSUMABLE_TYPE_ATTRIBUTE                             */
/*==============================================================*/
create table CONSUMABLE_TYPE_ATTRIBUTE
(
   CONSUMABLE_TYPE_ID   int not null  comment '',
   CONSUMABLE_ATTRIBUTE_DEFINITION_ID int not null  comment '',
   IS_MANDATORY         bool  comment '',
   DEFAULT_VALUE        varchar(255)  comment '',
   primary key (CONSUMABLE_TYPE_ID, CONSUMABLE_ATTRIBUTE_DEFINITION_ID)
);

/*==============================================================*/
/* Table: C_IS_COMPATIBLE_WITH_A                                */
/*==============================================================*/
create table C_IS_COMPATIBLE_WITH_A
(
   CONSUMABLE_MODEL_ID  int not null  comment '',
   ASSET_MODEL_ID       int not null  comment '',
   primary key (CONSUMABLE_MODEL_ID, ASSET_MODEL_ID)
);

/*==============================================================*/
/* Table: C_IS_COMPATIBLE_WITH_SI                               */
/*==============================================================*/
create table C_IS_COMPATIBLE_WITH_SI
(
   CONSUMABLE_MODEL_ID  int not null  comment '',
   STOCK_ITEM_MODEL_ID  int not null  comment '',
   primary key (CONSUMABLE_MODEL_ID, STOCK_ITEM_MODEL_ID)
);

/*==============================================================*/
/* Table: DESTRUCTION_CERTIFICATE                               */
/*==============================================================*/
create table DESTRUCTION_CERTIFICATE
(
   DESTRUCTION_CERTIFICATE_ID int not null  comment '',
   DIGITAL_COPY         blob  comment '',
   DESTRUCTION_DATETIME datetime  comment '',
   primary key (DESTRUCTION_CERTIFICATE_ID)
);

/*==============================================================*/
/* Table: EXTERNAL_MAINTENANCE                                  */
/*==============================================================*/
create table EXTERNAL_MAINTENANCE
(
   EXTERNAL_MAINTENANCE_ID int not null  comment '',
   MAINTENANCE_ID       int not null  comment '',
   ITEM_RECEIVED_BY_MAINTENANCE_PROVIDER_DATETIME datetime  comment '',
   ITEM_SENT_TO_COMPANY_DATETIME datetime  comment '',
   ITEM_SENT_TO_EXTERNAL_MAINTENANCE_DATETIME datetime  comment '',
   ITEM_RECEIVED_BY_COMPANY_DATETIME datetime  comment '',
   primary key (EXTERNAL_MAINTENANCE_ID)
);

/*==============================================================*/
/* Table: EXTERNAL_MAINTENANCE_DOCUMENT                         */
/*==============================================================*/
create table EXTERNAL_MAINTENANCE_DOCUMENT
(
   EXTERNAL_MAINTENANCE_DOCUMENT_ID int not null  comment '',
   EXTERNAL_MAINTENANCE_ID int not null  comment '',
   DOCUMENT_IS_SIGNED   bool  comment '',
   ITEM_IS_RECEIVED_BY_MAINTENANCE_PROVIDER bool  comment '',
   MAINTENANCE_PROVIDER_FINAL_DECISION varchar(60)  comment '',
   DIGITAL_COPY         blob  comment '',
   primary key (EXTERNAL_MAINTENANCE_DOCUMENT_ID)
);

/*==============================================================*/
/* Table: EXTERNAL_MAINTENANCE_PROVIDER                         */
/*==============================================================*/
create table EXTERNAL_MAINTENANCE_PROVIDER
(
   EXTERNAL_MAINTENANCE_PROVIDER_ID int not null  comment '',
   EXTERNAL_MAINTENANCE_PROVIDER_NAME varchar(48)  comment '',
   EXTERNAL_MAINTENANCE_PROVIDER_LOCATION varchar(128)  comment '',
   primary key (EXTERNAL_MAINTENANCE_PROVIDER_ID)
);

/*==============================================================*/
/* Table: EXTERNAL_MAINTENANCE_STEP                             */
/*==============================================================*/
create table EXTERNAL_MAINTENANCE_STEP
(
   EXTERNAL_MAINTENANCE_STEP_ID int not null  comment '',
   EXTERNAL_MAINTENANCE_PROVIDER_ID int not null  comment '',
   EXTERNAL_MAINTENANCE_ID int not null  comment '',
   EXTERNAL_MAINTENANCE_TYPICAL_STEP_ID int not null  comment '',
   START_DATETIME       datetime  comment '',
   END_DATETIME         datetime  comment '',
   IS_SUCCESSFUL        bool  comment '',
   primary key (EXTERNAL_MAINTENANCE_STEP_ID)
);

/*==============================================================*/
/* Table: EXTERNAL_MAINTENANCE_TYPICAL_STEP                     */
/*==============================================================*/
create table EXTERNAL_MAINTENANCE_TYPICAL_STEP
(
   EXTERNAL_MAINTENANCE_TYPICAL_STEP_ID int not null  comment '',
   ESTIMATED_COST       decimal(10,2)  comment '',
   ACTUAL_COST          decimal(10,2)  comment '',
   MAINTENANCE_TYPE     char(8)  comment 'Hardware or software',
   DESCRIPTION          varchar(256)  comment '',
   primary key (EXTERNAL_MAINTENANCE_TYPICAL_STEP_ID)
);

/*==============================================================*/
/* Table: FACTURE                                               */
/*==============================================================*/
create table FACTURE
(
   FACTURE_ID           int not null  comment '',
   BON_DE_LIVRAISON_ID  int not null  comment '',
   DIGITAL_COPY         blob  comment '',
   primary key (FACTURE_ID)
);

/*==============================================================*/
/* Table: MAINTENANCE                                           */
/*==============================================================*/
create table MAINTENANCE
(
   MAINTENANCE_ID       int not null  comment '',
   ASSET_ID             int not null  comment '',
   ASSIGNED_BY_PERSON_ID int not null  comment '',
   PERFORMED_BY_PERSON_ID int not null  comment '',
   APPROVED_BY_MAINTENANCE_CHIEF_ID int not null  comment '',
   IS_APPROVED_BY_MAINTENANCE_CHIEF bool  comment '',
   START_DATETIME       datetime not null  comment '',
   END_DATETIME         datetime not null  comment '',
   DESCRIPTION          varchar(256)  comment '',
   IS_SUCCESSFUL        bool  comment '',
   DIGITAL_COPY         blob  comment '',
   primary key (MAINTENANCE_ID)
);

/*==============================================================*/
/* Table: MAINTENANCE_INSPECTION_LEADS_TO_BROKEN_ITEM_REPORT    */
/*==============================================================*/
create table MAINTENANCE_INSPECTION_LEADS_TO_BROKEN_ITEM_REPORT
(
   MAINTENANCE_ID       int not null  comment '',
   BROKEN_ITEM_REPORT_ID int not null  comment '',
   primary key (MAINTENANCE_ID, BROKEN_ITEM_REPORT_ID)
);

/*==============================================================*/
/* Table: MAINTENANCE_STEP                                      */
/*==============================================================*/
create table MAINTENANCE_STEP
(
   MAINTENANCE_STEP_ID  int not null  comment '',
   MAINTENANCE_ID       int not null  comment '',
   MAINTENANCE_TYPICAL_STEP_ID int not null  comment '',
   PERSON_ID            int not null  comment '',
   ASSET_CONDITION_HISTORY_ID int  comment '',
   STOCK_ITEM_CONDITION_HISTORY_ID int  comment '',
   CONSUMABLE_CONDITION_HISTORY_ID int  comment '',
   START_DATETIME       datetime  comment '',
   END_DATETIME         datetime  comment '',
   IS_SUCCESSFUL        bool  comment '',
   primary key (MAINTENANCE_STEP_ID)
);

/*==============================================================*/
/* Table: MAINTENANCE_TYPICAL_STEP                              */
/*==============================================================*/
create table MAINTENANCE_TYPICAL_STEP
(
   MAINTENANCE_TYPICAL_STEP_ID int not null  comment '',
   ESTIMATED_COST       decimal(10,2)  comment '',
   ACTUAL_COST          decimal(10,2)  comment '',
   DESCRIPTION          varchar(256)  comment '',
   MAINTENANCE_TYPE     char(8)  comment 'Hardware or software',
   primary key (MAINTENANCE_TYPICAL_STEP_ID)
);

/*==============================================================*/
/* Table: ORGANIZATIONAL_STRUCTURE                              */
/*==============================================================*/
create table ORGANIZATIONAL_STRUCTURE
(
   ORGANIZATIONAL_STRUCTURE_ID int not null  comment '',
   STRUCTURE_CODE       varchar(50)  comment '',
   STRUCTURE_NAME       varchar(255)  comment '',
   STRUCTURE_TYPE       varchar(30)  comment '',
   IS_ACTIVE            bool  comment '',
   primary key (ORGANIZATIONAL_STRUCTURE_ID)
);

/*==============================================================*/
/* Table: ORGANIZATIONAL_STRUCTURE_RELATION                     */
/*==============================================================*/
create table ORGANIZATIONAL_STRUCTURE_RELATION
(
   ORGANIZATIONAL_STRUCTURE_ID int not null  comment '',
   PARENT_ORGANIZATIONAL_STRUCTURE_ID int not null  comment '',
   RELATION_ID          int  comment '',
   RELATION_TYPE        varchar(60)  comment '',
   primary key (ORGANIZATIONAL_STRUCTURE_ID, PARENT_ORGANIZATIONAL_STRUCTURE_ID)
);

/*==============================================================*/
/* Table: PERSON                                                */
/*==============================================================*/
create table PERSON
(
   PERSON_ID            int not null  comment '',
   FIRST_NAME           varchar(48) not null  comment '',
   LAST_NAME            varchar(48) not null  comment '',
   SEX                  char(6) not null  comment '',
   BIRTH_DATE           date not null  comment '',
   IS_APPROVED          bool not null  comment '',
   primary key (PERSON_ID)
);

/*==============================================================*/
/* Table: PERSON_ASSIGNMENT                                     */
/*==============================================================*/
create table PERSON_ASSIGNMENT
(
   ASSIGNMENT_ID        int not null  comment '',
   POSITION_ID          int not null  comment '',
   PERSON_ID            int not null  comment '',
   ASSIGNMENT_START_DATE date  comment '',
   ASSIGNMENT_END_DATE  date  comment '',
   EMPLOYMENT_TYPE      varchar(48)  comment 'Permanent, contractual...',
   primary key (ASSIGNMENT_ID)
);

/*==============================================================*/
/* Table: PERSON_REPORTS_PROBLEM_ON_ASSET                       */
/*==============================================================*/
create table PERSON_REPORTS_PROBLEM_ON_ASSET
(
   ASSET_ID             int not null  comment '',
   PERSON_ID            int not null  comment '',
   REPORT_ID            int not null  comment '',
   REPORT_DATETIME      datetime not null  comment '',
   OWNER_OBSERVATION    varchar(256) not null  comment '',
   primary key (REPORT_ID)
);

/*==============================================================*/
/* Table: PERSON_REPORTS_PROBLEM_ON_CONSUMABLE                  */
/*==============================================================*/
create table PERSON_REPORTS_PROBLEM_ON_CONSUMABLE
(
   PERSON_ID            int not null  comment '',
   CONSUMABLE_ID        int not null  comment '',
   REPORT_ID            int not null  comment '',
   REPORT_DATETIME      datetime not null  comment '',
   OWNER_OBSERVATION    varchar(256) not null  comment '',
   primary key (REPORT_ID)
);

/*==============================================================*/
/* Table: PERSON_REPORTS_PROBLEM_ON_STOCK_ITEM                  */
/*==============================================================*/
create table PERSON_REPORTS_PROBLEM_ON_STOCK_ITEM
(
   PERSON_ID            int not null  comment '',
   STOCK_ITEM_ID        int not null  comment '',
   REPORT_ID            int not null  comment '',
   REPORT_DATETIME      datetime not null  comment '',
   OWNER_OBSERVATION    varchar(256) not null  comment '',
   primary key (REPORT_ID)
);

/*==============================================================*/
/* Table: PHYSICAL_CONDITION                                    */
/*==============================================================*/
create table PHYSICAL_CONDITION
(
   CONDITION_ID         int not null  comment '',
   CONDITION_CODE       varchar(12)  comment '',
   CONDITION_LABEL      varchar(12)  comment '',
   DESCRIPTION          varchar(256)  comment '',
   primary key (CONDITION_ID)
);

/*==============================================================*/
/* Table: POSITION                                              */
/*==============================================================*/
create table POSITION
(
   POSITION_ID          int not null  comment '',
   POSITION_CODE        varchar(48)  comment '',
   POSITION_LABEL       varchar(60)  comment '',
   DESCRIPTION          varchar(256)  comment '',
   primary key (POSITION_ID)
);

/*==============================================================*/
/* Table: POSITION_ROLE_MAPPING                                 */
/*==============================================================*/
create table PERSON_ROLE_MAPPING
(
   ROLE_ID              int not null  comment 'Roles: TECHNICIAN, INVENTORY_MANAGER, ADMIN, VIEWER',
   PERSON_ID            int not null  comment '',
   primary key (ROLE_ID, PERSON_ID)
);

/*==============================================================*/
/* Table: RECEIPT_REPORT                                        */
/*==============================================================*/
create table RECEIPT_REPORT
(
   RECEIPT_REPORT_ID    int not null  comment '',
   REPORT_DATETIME      datetime  comment '',
   REPORT_FULL_CODE     varchar(48)  comment '',
   DIGITAL_COPY         blob  comment '',
   primary key (RECEIPT_REPORT_ID)
);

alter table RECEIPT_REPORT comment 'This represents the "PV de r�ception"';

/*==============================================================*/
/* Table: ROLE                                                  */
/*==============================================================*/
create table ROLE
(
   ROLE_ID              int not null  comment 'Roles: TECHNICIAN, INVENTORY_MANAGER, ADMIN, VIEWER',
   ROLE_CODE            varchar(24)  comment '',
   ROLE_LABEL           varchar(24)  comment '',
   DESCRIPTION          varchar(256)  comment '',
   primary key (ROLE_ID)
);

alter table ROLE comment 'Role is what the person can do in the system';

/*==============================================================*/
/* Table: ROOM                                                  */
/*==============================================================*/
create table ROOM
(
   ROOM_ID              int not null  comment '',
   ROOM_NAME            varchar(30)  comment '',
   ROOM_TYPE            varchar(24)  comment 'It  can be either "Storage Location" or "Work room" (bureau)',
   primary key (ROOM_ID)
);

/*==============================================================*/
/* Table: ROOM_BELONGS_TO_ORGANIZATIONAL_STRUCTURE              */
/*==============================================================*/
create table ROOM_BELONGS_TO_ORGANIZATIONAL_STRUCTURE
(
   ORGANIZATIONAL_STRUCTURE_ID int not null  comment '',
   ROOM_ID              int not null  comment '',
   primary key (ORGANIZATIONAL_STRUCTURE_ID, ROOM_ID)
);

/*==============================================================*/
/* Table: STOCK_ITEM                                            */
/*==============================================================*/
create table STOCK_ITEM
(
   STOCK_ITEM_ID        int not null  comment '',
   MAINTENANCE_STEP_ID  int  comment '',
   STOCK_ITEM_MODEL_ID  int not null  comment '',
   DESTRUCTION_CERTIFICATE_ID int not null  comment '',
   STOCK_ITEM_FABRICATION_DATETIME datetime  comment '',
   STOCK_ITEM_NAME      varchar(48)  comment '',
   STOCK_ITEM_INVENTORY_NUMBER varchar(6)  comment '',
   STOCK_ITEM_WARRANTY_EXPIRY_IN_MONTHS int  comment '',
   STOCK_ITEM_NAME_IN_ADMINISTRATIVE_CERTIFICATE varchar(48)  comment '',
   STOCK_ITEM_ARRIVAL_DATETIME datetime  comment '',
   STOCK_ITEM_STATUS    varchar(30)  comment '',
   primary key (STOCK_ITEM_ID)
);

/*==============================================================*/
/* Table: STOCK_ITEM_ATTRIBUTE_DEFINITION                       */
/*==============================================================*/
create table STOCK_ITEM_ATTRIBUTE_DEFINITION
(
   STOCK_ITEM_ATTRIBUTE_DEFINITION_ID int not null  comment '',
   UNIT                 varchar(24)  comment '',
   DESCRIPTION          varchar(256)  comment '',
   DATA_TYPE            varchar(18)  comment '',
   primary key (STOCK_ITEM_ATTRIBUTE_DEFINITION_ID)
);

/*==============================================================*/
/* Table: STOCK_ITEM_ATTRIBUTE_VALUE                            */
/*==============================================================*/
create table STOCK_ITEM_ATTRIBUTE_VALUE
(
   STOCK_ITEM_ATTRIBUTE_DEFINITION_ID int not null  comment '',
   STOCK_ITEM_ID        int not null  comment '',
   VALUE_STRING         varchar(1024)  comment '',
   VALUE_BOOL           bool  comment '',
   VALUE_DATE           date  comment '',
   VALUE_NUMBER         decimal(18,6)  comment '',
   primary key (STOCK_ITEM_ATTRIBUTE_DEFINITION_ID, STOCK_ITEM_ID)
);

/*==============================================================*/
/* Table: STOCK_ITEM_BRAND                                      */
/*==============================================================*/
create table STOCK_ITEM_BRAND
(
   STOCK_ITEM_BRAND_ID  int not null  comment '',
   BRAND_NAME           varchar(48)  comment '',
   BRAND_CODE           varchar(16)  comment '',
   IS_ACTIVE            bool  comment '',
   primary key (STOCK_ITEM_BRAND_ID)
);

/*==============================================================*/
/* Table: STOCK_ITEM_CONDITION_HISTORY                          */
/*==============================================================*/
create table STOCK_ITEM_CONDITION_HISTORY
(
   STOCK_ITEM_CONDITION_HISTORY_ID int not null  comment '',
   STOCK_ITEM_ID        int not null  comment '',
   CONDITION_ID         int not null  comment '',
   NOTES                varchar(256)  comment '',
   COSMETIC_ISSUES      varchar(128)  comment '',
   FUNCTIONAL_ISSUES    varchar(128)  comment '',
   RECOMMENDATION       varchar(24)  comment '',
   CREATED_AT           datetime  comment '',
   primary key (STOCK_ITEM_CONDITION_HISTORY_ID)
);

/*==============================================================*/
/* Table: STOCK_ITEM_IS_ASSIGNED_TO_PERSON                      */
/*==============================================================*/
create table STOCK_ITEM_IS_ASSIGNED_TO_PERSON
(
   STOCK_ITEM_ID        int not null  comment '',
   PERSON_ID            int not null  comment '',
   ASSIGNED_BY_PERSON_ID int not null  comment '',
   ASSIGNMENT_ID        int not null  comment '',
   START_DATETIME       datetime not null  comment '',
   END_DATETIME         datetime not null  comment '',
   CONDITION_ON_ASSIGNMENT varchar(48) not null  comment '',
   IS_ACTIVE            bool not null  comment '',
   primary key (ASSIGNMENT_ID)
);

alter table STOCK_ITEM_IS_ASSIGNED_TO_PERSON comment 'The first person is the one to whom the stock item is assign';

/*==============================================================*/
/* Table: STOCK_ITEM_IS_COMPATIBLE_WITH_ASSET                   */
/*==============================================================*/
create table STOCK_ITEM_IS_COMPATIBLE_WITH_ASSET
(
   STOCK_ITEM_MODEL_ID  int not null  comment '',
   ASSET_MODEL_ID       int not null  comment '',
   primary key (STOCK_ITEM_MODEL_ID, ASSET_MODEL_ID)
);

/*==============================================================*/
/* Table: STOCK_ITEM_MODEL                                      */
/*==============================================================*/
create table STOCK_ITEM_MODEL
(
   STOCK_ITEM_MODEL_ID  int not null  comment '',
   STOCK_ITEM_TYPE_ID   int not null  comment '',
   STOCK_ITEM_BRAND_ID  int not null  comment '',
   MODEL_NAME           varchar(48)  comment '',
   MODEL_CODE           varchar(16)  comment '',
   RELEASE_YEAR         int  comment '',
   DISCONTINUED_YEAR    int  comment '',
   IS_ACTIVE            bool  comment '',
   NOTES                varchar(256)  comment '',
   WARRANTY_EXPIRY_IN_MONTHS int  comment '',
   primary key (STOCK_ITEM_MODEL_ID)
);

/*==============================================================*/
/* Table: STOCK_ITEM_MODEL_ATTRIBUTE_VALUE                      */
/*==============================================================*/
create table STOCK_ITEM_MODEL_ATTRIBUTE_VALUE
(
   STOCK_ITEM_ATTRIBUTE_DEFINITION_ID int not null  comment '',
   STOCK_ITEM_MODEL_ID  int not null  comment '',
   VALUE_BOOL           bool  comment '',
   VALUE_STRING         varchar(1024)  comment '',
   VALUE_DATE           date  comment '',
   VALUE_NUMBER         decimal(18,6)  comment '',
   primary key (STOCK_ITEM_ATTRIBUTE_DEFINITION_ID, STOCK_ITEM_MODEL_ID)
);

/*==============================================================*/
/* Table: STOCK_ITEM_MODEL_IS_FOUND_IN_BDC                      */
/*==============================================================*/
create table STOCK_ITEM_MODEL_IS_FOUND_IN_BDC
(
   STOCK_ITEM_MODEL_ID  int not null  comment '',
   BON_DE_COMMANDE_ID   int not null  comment '',
   QUANTITY_ORDERED     int  comment '',
   QUANTITY_RECEIVED    int  comment '',
   QUANTITY_INVOICED    int  comment '',
   UNIT_PRICE           decimal(10,2)  comment '',
   primary key (STOCK_ITEM_MODEL_ID, BON_DE_COMMANDE_ID)
);

/*==============================================================*/
/* Table: STOCK_ITEM_MOVEMENT                                   */
/*==============================================================*/
create table STOCK_ITEM_MOVEMENT
(
   STOCK_ITEM_MOVEMENT_ID int not null  comment '',
   STOCK_ITEM_ID        int not null  comment '',
   SOURCE_ROOM_ID       int not null  comment '',
   DESTINATION_ROOM_ID  int not null  comment '',
   MAINTENANCE_STEP_ID  int  comment '',
   EXTERNAL_MAINTENANCE_STEP_ID int  comment '',
   MOVEMENT_REASON      varchar(128) not null  comment '',
   MOVEMENT_DATETIME    datetime not null  comment '',
   primary key (STOCK_ITEM_MOVEMENT_ID)
);

/*==============================================================*/
/* Table: STOCK_ITEM_TYPE                                       */
/*==============================================================*/
create table STOCK_ITEM_TYPE
(
   STOCK_ITEM_TYPE_ID   int not null  comment '',
   STOCK_ITEM_TYPE_LABEL varchar(60)  comment '',
   STOCK_ITEM_TYPE_CODE varchar(18)  comment '',
   primary key (STOCK_ITEM_TYPE_ID)
);

/*==============================================================*/
/* Table: STOCK_ITEM_TYPE_ATTRIBUTE                             */
/*==============================================================*/
create table STOCK_ITEM_TYPE_ATTRIBUTE
(
   STOCK_ITEM_ATTRIBUTE_DEFINITION_ID int not null  comment '',
   STOCK_ITEM_TYPE_ID   int not null  comment '',
   IS_MANDATORY         bool  comment '',
   DEFAULT_VALUE        varchar(255)  comment '',
   primary key (STOCK_ITEM_ATTRIBUTE_DEFINITION_ID, STOCK_ITEM_TYPE_ID)
);

/*==============================================================*/
/* Table: SUPERUSER_CREATES_ACCOUNT                             */
/*==============================================================*/
/* Removed SUPERUSER_MODIFIES_ACCOUNT and SUPERUSER_CREATES_ACCOUNT */

/* Removed comment for SUPERUSER_CREATES_ACCOUNT */

/*==============================================================*/
/* Table: SUPERUSER_MODIFIES_ACCOUNT                            */
/*==============================================================*/
/* Removed SUPERUSER_MODIFIES_ACCOUNT and SUPERUSER_CREATES_ACCOUNT */

/* Removed comment for SUPERUSER_MODIFIES_ACCOUNT */

/*==============================================================*/
/* Table: SUPPLIER                                              */
/*==============================================================*/
create table SUPPLIER
(
   SUPPLIER_ID          int not null  comment '',
   SUPPLIER_NAME        varchar(60)  comment '',
   SUPPLIER_ADDRESS     varchar(128)  comment '',
   SUPPLIER_COMMERCIAL_REGISTER_NUMBER varchar(128)  comment '',
   SUPPLIER_RIB         int  comment '',
   SUPPLIER_CPA         varchar(128)  comment '',
   SUPPLIER_FISCAL_IDENTIFICATION_NUMBER int  comment '',
   SUPPLIER_FISCAL_STATIC_NUMBER int  comment '',
   primary key (SUPPLIER_ID)
);

/*==============================================================*/
/* Table: USER_ACCOUNT                                          */
/*==============================================================*/
create table USER_ACCOUNT
(
   USER_ID              int not null  comment '',
   PERSON_ID            int not null  comment '',
   USERNAME             varchar(20) not null  comment '',
   PASSWORD_HASH        varchar(512) not null  comment '',
   CREATED_AT_DATETIME  datetime not null  comment '',
   DISABLED_AT_DATETIME datetime not null  comment '',
   LAST_LOGIN           timestamp not null  comment '',
   ACCOUNT_STATUS       varchar(24) not null  comment '',
   FAILED_LOGIN_ATTEMPTS int not null  comment '',
   PASSWORD_LAST_CHANGED_DATETIME datetime not null  comment '',
   CREATED_BY_USER_ID   int  comment '',
   MODIFIED_BY_USER_ID  int  comment '',
   MODIFIED_AT_DATETIME datetime not null  comment '',
   primary key (USER_ID)
);

/*==============================================================*/
/* Table: USER_SESSION                                          */
/*==============================================================*/
create table USER_SESSION
(
   SESSION_ID           int not null  comment '',
   USER_ID              int not null  comment '',
   IP_ADDRESS           varchar(45) not null  comment '',
   USER_AGENT           varchar(60)  comment '',
   LOGIN_DATETIME       datetime not null  comment '',
   LAST_ACTIVITY        datetime not null  comment '',
   LOGOUT_DATETIME      datetime  comment '',
   primary key (SESSION_ID)
);

/*==============================================================*/
/* Table: WAREHOUSE                                             */
/*==============================================================*/
create table WAREHOUSE
(
   WAREHOUSE_ID         int not null  comment '',
   WAREHOUSE_NAME       varchar(60)  comment '',
   WAREHOUSE_ADDRESS    varchar(128)  comment '',
   primary key (WAREHOUSE_ID)
);

alter table WAREHOUSE comment 'Warehouse" is in our case "ERI/2RM';

alter table ADMINISTRATIVE_CERTIFICATE add constraint FK_ADMINIST_AC_IS_LIN_RECEIPT_ foreign key (RECEIPT_REPORT_ID)
      references RECEIPT_REPORT (RECEIPT_REPORT_ID) on delete restrict on update restrict;

alter table ADMINISTRATIVE_CERTIFICATE add constraint FK_ADMINIST_AD_IS_BRO_WAREHOUS foreign key (WAREHOUSE_ID)
      references WAREHOUSE (WAREHOUSE_ID) on delete restrict on update restrict;

alter table ADMINISTRATIVE_CERTIFICATE add constraint FK_ADMINIST_AO_LEADS__ATTRIBUT foreign key (ATTRIBUTION_ORDER_ID)
      references ATTRIBUTION_ORDER (ATTRIBUTION_ORDER_ID) on delete restrict on update restrict;

/* Removed AO_IS_LINKED_TO_RR constraints */

alter table ASSET add constraint FK_ASSET_ASSET_IS__DESTRUCT foreign key (DESTRUCTION_CERTIFICATE_ID)
      references DESTRUCTION_CERTIFICATE (DESTRUCTION_CERTIFICATE_ID) on delete restrict on update restrict;

alter table ASSET add constraint FK_ASSET_ASSET_IS__ATTRIBUT foreign key (ATTRIBUTION_ORDER_ID)
      references ATTRIBUTION_ORDER (ATTRIBUTION_ORDER_ID) on delete restrict on update restrict;

alter table ASSET add constraint FK_ASSET_ASSET_IS__ASSET_MO foreign key (ASSET_MODEL_ID)
      references ASSET_MODEL (ASSET_MODEL_ID) on delete restrict on update restrict;

alter table ASSET_ATTRIBUTE_VALUE add constraint FK_ASSET_AT_ASSET_ATT_ASSET foreign key (ASSET_ID)
      references ASSET (ASSET_ID) on delete restrict on update restrict;

alter table ASSET_ATTRIBUTE_VALUE add constraint FK_ASSET_AT_ASSET_ATT_ASSET_AT foreign key (ASSET_ATTRIBUTE_DEFINITION_ID)
      references ASSET_ATTRIBUTE_DEFINITION (ASSET_ATTRIBUTE_DEFINITION_ID) on delete restrict on update restrict;

alter table ASSET_CONDITION_HISTORY add constraint FK_ASSET_CO_ASSET_CON_PHYSICAL foreign key (CONDITION_ID)
      references PHYSICAL_CONDITION (CONDITION_ID) on delete restrict on update restrict;

alter table ASSET_CONDITION_HISTORY add constraint FK_ASSET_CO_ASSET_HAS_ASSET foreign key (ASSET_ID)
      references ASSET (ASSET_ID) on delete restrict on update restrict;

alter table ASSET_IS_ASSIGNED_TO_PERSON add constraint FK_ASSET_IS_ASSET_IS__PERSON_ASSIGNER foreign key (ASSIGNED_BY_PERSON_ID)
      references PERSON (PERSON_ID) on delete restrict on update restrict;

alter table ASSET_IS_ASSIGNED_TO_PERSON add constraint FK_ASSET_IS_ASSET_IS__PERSON_ASSIGNED foreign key (PERSON_ID)
      references PERSON (PERSON_ID) on delete restrict on update restrict;

alter table ASSET_IS_ASSIGNED_TO_PERSON add constraint FK_AIATP_ASSET foreign key (ASSET_ID)
      references ASSET (ASSET_ID) on delete restrict on update restrict;

alter table ASSET_IS_COMPOSED_OF_CONSUMABLE_HISTORY add constraint FK_AICOC_ASSET foreign key (ASSET_ID)
      references ASSET (ASSET_ID) on delete restrict on update restrict;

alter table ASSET_IS_COMPOSED_OF_CONSUMABLE_HISTORY add constraint FK_ASSET_IS_ASSET_IS__CONSUMAB foreign key (CONSUMABLE_ID)
      references CONSUMABLE (CONSUMABLE_ID) on delete restrict on update restrict;

alter table ASSET_IS_COMPOSED_OF_CONSUMABLE_HISTORY add constraint FK_AICOC_MAINTENANCE_STEP foreign key (MAINTENANCE_STEP_ID)
      references MAINTENANCE_STEP (MAINTENANCE_STEP_ID) on delete restrict on update restrict;

alter table ASSET_IS_COMPOSED_OF_STOCK_ITEMS_HISTORY add constraint FK_AICOSI_MAINTENANCE_STEP foreign key (MAINTENANCE_STEP_ID)
      references MAINTENANCE_STEP (MAINTENANCE_STEP_ID) on delete restrict on update restrict;

alter table ASSET_IS_COMPOSED_OF_STOCK_ITEMS_HISTORY add constraint FK_AICOSI_ASSET foreign key (ASSET_ID)
      references ASSET (ASSET_ID) on delete restrict on update restrict;

alter table ASSET_IS_COMPOSED_OF_STOCK_ITEMS_HISTORY add constraint FK_ASSET_IS_ASSET_IS__STOCK_IT foreign key (STOCK_ITEM_ID)
      references STOCK_ITEM (STOCK_ITEM_ID) on delete restrict on update restrict;

alter table ASSET_MODEL add constraint FK_ASSET_MO_ASSET_MOD_ASSET_BR foreign key (ASSET_BRAND_ID)
      references ASSET_BRAND (ASSET_BRAND_ID) on delete restrict on update restrict;

alter table ASSET_MODEL add constraint FK_ASSET_MO_ASSET_TYP_ASSET_TY foreign key (ASSET_TYPE_ID)
      references ASSET_TYPE (ASSET_TYPE_ID) on delete restrict on update restrict;

alter table ASSET_MODEL_ATTRIBUTE_VALUE add constraint FK_ASSET_MO_ASSET_MOD_ASSET_AT foreign key (ASSET_ATTRIBUTE_DEFINITION_ID)
      references ASSET_ATTRIBUTE_DEFINITION (ASSET_ATTRIBUTE_DEFINITION_ID) on delete restrict on update restrict;

alter table ASSET_MODEL_ATTRIBUTE_VALUE add constraint FK_ASSET_MO_ASSET_MOD_ASSET_MO foreign key (ASSET_MODEL_ID)
      references ASSET_MODEL (ASSET_MODEL_ID) on delete restrict on update restrict;

alter table ASSET_MOVEMENT add constraint FK_ASSET_MO_ASSET_MOV_EXTERNAL foreign key (EXTERNAL_MAINTENANCE_STEP_ID)
      references EXTERNAL_MAINTENANCE_STEP (EXTERNAL_MAINTENANCE_STEP_ID) on delete restrict on update restrict;

alter table ASSET_MOVEMENT add constraint FK_ASSET_MO_ASSET_MOV_ASSET foreign key (ASSET_ID)
      references ASSET (ASSET_ID) on delete restrict on update restrict;

alter table ASSET_MOVEMENT add constraint FK_ASSET_MO_ASSET_MOV_ROOM_SOURCE foreign key (SOURCE_ROOM_ID)
      references ROOM (ROOM_ID) on delete restrict on update restrict;

alter table ASSET_MOVEMENT add constraint FK_ASSET_MO_ASSET_MOV_ROOM_DEST foreign key (DESTINATION_ROOM_ID)
      references ROOM (ROOM_ID) on delete restrict on update restrict;

alter table ASSET_MOVEMENT add constraint FK_ASSET_MO_ASSET_MOV_MAINTENA foreign key (MAINTENANCE_STEP_ID)
      references MAINTENANCE_STEP (MAINTENANCE_STEP_ID) on delete restrict on update restrict;

alter table ASSET_TYPE_ATTRIBUTE add constraint FK_ASSET_TY_ASSET_TYP_ASSET_TY foreign key (ASSET_TYPE_ID)
      references ASSET_TYPE (ASSET_TYPE_ID) on delete restrict on update restrict;

alter table ASSET_TYPE_ATTRIBUTE add constraint FK_ASSET_TY_ASSET_TYP_ASSET_AT foreign key (ASSET_ATTRIBUTE_DEFINITION_ID)
      references ASSET_ATTRIBUTE_DEFINITION (ASSET_ATTRIBUTE_DEFINITION_ID) on delete restrict on update restrict;

alter table ATTRIBUTION_ORDER add constraint FK_ATTRIBUT_SHIPMENT__WAREHOUS foreign key (WAREHOUSE_ID)
      references WAREHOUSE (WAREHOUSE_ID) on delete restrict on update restrict;

alter table AUTHENTICATION_LOG add constraint FK_AUTHENTI_USER_HAS__USER_ACC foreign key (USER_ID)
      references USER_ACCOUNT (USER_ID) on delete restrict on update restrict;

alter table BON_DE_COMMANDE add constraint FK_BON_DE_C_BDC_IS_MA_SUPPLIER foreign key (SUPPLIER_ID)
      references SUPPLIER (SUPPLIER_ID) on delete restrict on update restrict;

alter table BON_DE_LIVRAISON add constraint FK_BON_DE_L_BON_DE_CO_BON_DE_C foreign key (BON_DE_COMMANDE_ID)
      references BON_DE_COMMANDE (BON_DE_COMMANDE_ID) on delete restrict on update restrict;

alter table BON_DE_RESTE add constraint FK_BON_DE_R_BDC_HAS_B_BON_DE_C foreign key (BON_DE_COMMANDE_ID)
      references BON_DE_COMMANDE (BON_DE_COMMANDE_ID) on delete restrict on update restrict;

alter table COMPANY_ASSET_REQUEST add constraint FK_COMPANY__AO_LEADS__ATTRIBUT foreign key (ATTRIBUTION_ORDER_ID)
      references ATTRIBUTION_ORDER (ATTRIBUTION_ORDER_ID) on delete restrict on update restrict;

/* Removed COMPANY_ASSET_REQUEST_IS_LINKED_TO_RECEIPT_REPORT constraints */

alter table CONSUMABLE add constraint FK_CONSUMAB_CONSUMABL_DESTRUCT foreign key (DESTRUCTION_CERTIFICATE_ID)
      references DESTRUCTION_CERTIFICATE (DESTRUCTION_CERTIFICATE_ID) on delete restrict on update restrict;

alter table CONSUMABLE add constraint FK_CONSUMABLE_MODEL foreign key (CONSUMABLE_MODEL_ID)
      references CONSUMABLE_MODEL (CONSUMABLE_MODEL_ID) on delete restrict on update restrict;

alter table CONSUMABLE_ATTRIBUTE_VALUE add constraint FK_CAV_ATTRIBUTE_DEF foreign key (CONSUMABLE_ATTRIBUTE_DEFINITION_ID)
      references CONSUMABLE_ATTRIBUTE_DEFINITION (CONSUMABLE_ATTRIBUTE_DEFINITION_ID) on delete restrict on update restrict;

alter table CONSUMABLE_ATTRIBUTE_VALUE add constraint FK_CAV_CONSUMABLE foreign key (CONSUMABLE_ID)
      references CONSUMABLE (CONSUMABLE_ID) on delete restrict on update restrict;

alter table CONSUMABLE_CONDITION_HISTORY add constraint FK_CONSUMAB_ASSOCIATI_CONSUMAB foreign key (CONSUMABLE_ID)
      references CONSUMABLE (CONSUMABLE_ID) on delete restrict on update restrict;

alter table CONSUMABLE_CONDITION_HISTORY_HAS_PHYSICAL_CONDITION add constraint FK_CONSUMAB_CONSUMABL_PHYSICAL foreign key (CONDITION_ID)
      references PHYSICAL_CONDITION (CONDITION_ID) on delete restrict on update restrict;

alter table CONSUMABLE_CONDITION_HISTORY_HAS_PHYSICAL_CONDITION add constraint FK_CCHHPC_HISTORY foreign key (CONSUMABLE_CONDITION_HISTORY_ID)
      references CONSUMABLE_CONDITION_HISTORY (CONSUMABLE_CONDITION_HISTORY_ID) on delete restrict on update restrict;

alter table CONSUMABLE_IS_ASSIGNED_TO_PERSON add constraint FK_CONSUMAB_CONSUMABL_PERSON_ASSIGNED foreign key (ASSIGNED_BY_PERSON_ID)
      references PERSON (PERSON_ID) on delete restrict on update restrict;

alter table CONSUMABLE_IS_ASSIGNED_TO_PERSON add constraint FK_CIATP_CONSUMABLE foreign key (CONSUMABLE_ID)
      references CONSUMABLE (CONSUMABLE_ID) on delete restrict on update restrict;

alter table CONSUMABLE_IS_ASSIGNED_TO_PERSON add constraint FK_CONSUMAB_CONSUMABL_PERSON_ASSIGNER foreign key (PERSON_ID)
      references PERSON (PERSON_ID) on delete restrict on update restrict;

alter table CONSUMABLE_IS_USED_IN_STOCK_ITEM_HISTORY add constraint FK_CIUISIH_CONSUMABLE foreign key (CONSUMABLE_ID)
      references CONSUMABLE (CONSUMABLE_ID) on delete restrict on update restrict;

alter table CONSUMABLE_IS_USED_IN_STOCK_ITEM_HISTORY add constraint FK_CIUISIH_MAINTENANCE foreign key (MAINTENANCE_STEP_ID)
      references MAINTENANCE_STEP (MAINTENANCE_STEP_ID) on delete restrict on update restrict;

alter table CONSUMABLE_IS_USED_IN_STOCK_ITEM_HISTORY add constraint FK_CONSUMAB_CONSUMABL_STOCK_IT foreign key (STOCK_ITEM_ID)
      references STOCK_ITEM (STOCK_ITEM_ID) on delete restrict on update restrict;

alter table CONSUMABLE_MODEL add constraint FK_CM_BRAND foreign key (CONSUMABLE_BRAND_ID)
      references CONSUMABLE_BRAND (CONSUMABLE_BRAND_ID) on delete restrict on update restrict;

alter table CONSUMABLE_MODEL add constraint FK_CM_TYPE foreign key (CONSUMABLE_TYPE_ID)
      references CONSUMABLE_TYPE (CONSUMABLE_TYPE_ID) on delete restrict on update restrict;

alter table CONSUMABLE_MODEL_ATTRIBUTE_VALUE add constraint FK_CMAV_ATTRIBUTE_DEF foreign key (CONSUMABLE_ATTRIBUTE_DEFINITION_ID)
      references CONSUMABLE_ATTRIBUTE_DEFINITION (CONSUMABLE_ATTRIBUTE_DEFINITION_ID) on delete restrict on update restrict;

alter table CONSUMABLE_MODEL_ATTRIBUTE_VALUE add constraint FK_CMAV_MODEL foreign key (CONSUMABLE_MODEL_ID)
      references CONSUMABLE_MODEL (CONSUMABLE_MODEL_ID) on delete restrict on update restrict;

alter table CONSUMABLE_MODEL_IS_FOUND_IN_BDC add constraint FK_CONSUMAB_CONSUMABL_BON_DE_C foreign key (BON_DE_COMMANDE_ID)
      references BON_DE_COMMANDE (BON_DE_COMMANDE_ID) on delete restrict on update restrict;

alter table CONSUMABLE_MODEL_IS_FOUND_IN_BDC add constraint FK_CMIFIB_MODEL foreign key (CONSUMABLE_MODEL_ID)
      references CONSUMABLE_MODEL (CONSUMABLE_MODEL_ID) on delete restrict on update restrict;

alter table CONSUMABLE_MOVEMENT add constraint FK_CM_CONSUMABLE foreign key (CONSUMABLE_ID)
      references CONSUMABLE (CONSUMABLE_ID) on delete restrict on update restrict;

alter table CONSUMABLE_MOVEMENT add constraint FK_CONSUMAB_CONSUMABL_ROOM_DEST foreign key (DESTINATION_ROOM_ID)
      references ROOM (ROOM_ID) on delete restrict on update restrict;

alter table CONSUMABLE_MOVEMENT add constraint FK_CONSUMAB_CONSUMABL_ROOM_SOURCE foreign key (SOURCE_ROOM_ID)
      references ROOM (ROOM_ID) on delete restrict on update restrict;

alter table CONSUMABLE_MOVEMENT add constraint FK_CM_MAINTENANCE foreign key (MAINTENANCE_STEP_ID)
      references MAINTENANCE_STEP (MAINTENANCE_STEP_ID) on delete restrict on update restrict;

alter table CONSUMABLE_MOVEMENT add constraint FK_CONSUMAB_CONSUMABL_EXTERNAL foreign key (EXTERNAL_MAINTENANCE_STEP_ID)
      references EXTERNAL_MAINTENANCE_STEP (EXTERNAL_MAINTENANCE_STEP_ID) on delete restrict on update restrict;

alter table CONSUMABLE_TYPE_ATTRIBUTE add constraint FK_CTA_ATTRIBUTE_DEF foreign key (CONSUMABLE_ATTRIBUTE_DEFINITION_ID)
      references CONSUMABLE_ATTRIBUTE_DEFINITION (CONSUMABLE_ATTRIBUTE_DEFINITION_ID) on delete restrict on update restrict;

alter table CONSUMABLE_TYPE_ATTRIBUTE add constraint FK_CTA_TYPE foreign key (CONSUMABLE_TYPE_ID)
      references CONSUMABLE_TYPE (CONSUMABLE_TYPE_ID) on delete restrict on update restrict;

alter table C_IS_COMPATIBLE_WITH_A add constraint FK_C_IS_COM_C_IS_COMP_ASSET_MO foreign key (ASSET_MODEL_ID)
      references ASSET_MODEL (ASSET_MODEL_ID) on delete restrict on update restrict;

alter table C_IS_COMPATIBLE_WITH_A add constraint FK_CICWA_CONSUMABLE_MODEL foreign key (CONSUMABLE_MODEL_ID)
      references CONSUMABLE_MODEL (CONSUMABLE_MODEL_ID) on delete restrict on update restrict;

alter table C_IS_COMPATIBLE_WITH_SI add constraint FK_C_IS_COM_C_IS_COMP_STOCK_IT foreign key (STOCK_ITEM_MODEL_ID)
      references STOCK_ITEM_MODEL (STOCK_ITEM_MODEL_ID) on delete restrict on update restrict;

alter table C_IS_COMPATIBLE_WITH_SI add constraint FK_CICWSI_CONSUMABLE_MODEL foreign key (CONSUMABLE_MODEL_ID)
      references CONSUMABLE_MODEL (CONSUMABLE_MODEL_ID) on delete restrict on update restrict;

alter table EXTERNAL_MAINTENANCE add constraint FK_EXTERNAL_MAINTENAN_MAINTENA foreign key (MAINTENANCE_ID)
      references MAINTENANCE (MAINTENANCE_ID) on delete restrict on update restrict;

alter table EXTERNAL_MAINTENANCE_DOCUMENT add constraint FK_EMD_EXTERNAL_MAINTENANCE foreign key (EXTERNAL_MAINTENANCE_ID)
      references EXTERNAL_MAINTENANCE (EXTERNAL_MAINTENANCE_ID) on delete restrict on update restrict;

alter table EXTERNAL_MAINTENANCE_STEP add constraint FK_EXTERNAL_EMS_IS_A__EXTERNAL foreign key (EXTERNAL_MAINTENANCE_TYPICAL_STEP_ID)
      references EXTERNAL_MAINTENANCE_TYPICAL_STEP (EXTERNAL_MAINTENANCE_TYPICAL_STEP_ID) on delete restrict on update restrict;

alter table EXTERNAL_MAINTENANCE_STEP add constraint FK_EMS_EXTERNAL_MAINTENANCE foreign key (EXTERNAL_MAINTENANCE_ID)
      references EXTERNAL_MAINTENANCE (EXTERNAL_MAINTENANCE_ID) on delete restrict on update restrict;

alter table EXTERNAL_MAINTENANCE_STEP add constraint FK_EMS_PROVIDER foreign key (EXTERNAL_MAINTENANCE_PROVIDER_ID)
      references EXTERNAL_MAINTENANCE_PROVIDER (EXTERNAL_MAINTENANCE_PROVIDER_ID) on delete restrict on update restrict;

alter table FACTURE add constraint FK_FACTURE_BON_DE_LI_BON_DE_L foreign key (BON_DE_LIVRAISON_ID)
      references BON_DE_LIVRAISON (BON_DE_LIVRAISON_ID) on delete restrict on update restrict;

alter table MAINTENANCE add constraint FK_MAINTENA_ASSET_IS__ASSET foreign key (ASSET_ID)
      references ASSET (ASSET_ID) on delete restrict on update restrict;

alter table MAINTENANCE add constraint FK_MAINTENA_MAINTENAN_PERSON foreign key (PERFORMED_BY_PERSON_ID)
      references PERSON (PERSON_ID) on delete restrict on update restrict;

alter table MAINTENANCE add constraint FK_MAINTENA_PERSON_AS_PERSON foreign key (APPROVED_BY_MAINTENANCE_CHIEF_ID)
      references PERSON (PERSON_ID) on delete restrict on update restrict;

alter table MAINTENANCE add constraint FK_MAINTENANCE_ASSIGNED_PERSON foreign key (ASSIGNED_BY_PERSON_ID)
      references PERSON (PERSON_ID) on delete restrict on update restrict;

alter table MAINTENANCE_INSPECTION_LEADS_TO_BROKEN_ITEM_REPORT add constraint FK_MAINTENA_MAINTENAN_BROKEN_I foreign key (BROKEN_ITEM_REPORT_ID)
      references BROKEN_ITEM_REPORT (BROKEN_ITEM_REPORT_ID) on delete restrict on update restrict;

alter table MAINTENANCE_INSPECTION_LEADS_TO_BROKEN_ITEM_REPORT add constraint FK_MILBIR_MAINTENANCE foreign key (MAINTENANCE_ID)
      references MAINTENANCE (MAINTENANCE_ID) on delete restrict on update restrict;

alter table MAINTENANCE_STEP add constraint FK_MAINTENA_ASSET_CON_ASSET_CO foreign key (ASSET_CONDITION_HISTORY_ID)
      references ASSET_CONDITION_HISTORY (ASSET_CONDITION_HISTORY_ID) on delete restrict on update restrict;

alter table MAINTENANCE_STEP add constraint FK_MAINTENA_CONSUMABL_CONSUMAB foreign key (CONSUMABLE_CONDITION_HISTORY_ID)
      references CONSUMABLE_CONDITION_HISTORY (CONSUMABLE_CONDITION_HISTORY_ID) on delete restrict on update restrict;

alter table MAINTENANCE_STEP add constraint FK_MS_MAINTENANCE foreign key (MAINTENANCE_ID)
      references MAINTENANCE (MAINTENANCE_ID) on delete restrict on update restrict;

alter table MAINTENANCE_STEP add constraint FK_MS_TYPICAL_STEP foreign key (MAINTENANCE_TYPICAL_STEP_ID)
      references MAINTENANCE_TYPICAL_STEP (MAINTENANCE_TYPICAL_STEP_ID) on delete restrict on update restrict;

alter table MAINTENANCE_STEP add constraint FK_MS_PERSON foreign key (PERSON_ID)
      references PERSON (PERSON_ID) on delete restrict on update restrict;

alter table MAINTENANCE_STEP add constraint FK_MAINTENA_STOCK_ITE_STOCK_IT foreign key (STOCK_ITEM_CONDITION_HISTORY_ID)
      references STOCK_ITEM_CONDITION_HISTORY (STOCK_ITEM_CONDITION_HISTORY_ID) on delete restrict on update restrict;

alter table ORGANIZATIONAL_STRUCTURE_RELATION add constraint FK_ORGANIZA_ORGANIZAT_ORGANIZA_PARENT foreign key (PARENT_ORGANIZATIONAL_STRUCTURE_ID)
      references ORGANIZATIONAL_STRUCTURE (ORGANIZATIONAL_STRUCTURE_ID) on delete restrict on update restrict;

alter table ORGANIZATIONAL_STRUCTURE_RELATION add constraint FK_ORGANIZA_ORGANIZAT_ORGANIZA_CHILD foreign key (ORGANIZATIONAL_STRUCTURE_ID)
      references ORGANIZATIONAL_STRUCTURE (ORGANIZATIONAL_STRUCTURE_ID) on delete restrict on update restrict;

alter table PERSON_ASSIGNMENT add constraint FK_PERSON_A_PERSON_HA_PERSON foreign key (PERSON_ID)
      references PERSON (PERSON_ID) on delete restrict on update restrict;

alter table PERSON_ASSIGNMENT add constraint FK_PERSON_A_PERSON_IS_POSITION foreign key (POSITION_ID)
      references POSITION (POSITION_ID) on delete restrict on update restrict;

alter table PERSON_REPORTS_PROBLEM_ON_ASSET add constraint FK_PERSON_R_PERSON_RE_ASSET foreign key (ASSET_ID)
      references ASSET (ASSET_ID) on delete restrict on update restrict;

alter table PERSON_REPORTS_PROBLEM_ON_ASSET add constraint FK_PRPOA_PERSON foreign key (PERSON_ID)
      references PERSON (PERSON_ID) on delete restrict on update restrict;

alter table PERSON_REPORTS_PROBLEM_ON_CONSUMABLE add constraint FK_PERSON_R_PERSON_RE_CONSUMAB foreign key (CONSUMABLE_ID)
      references CONSUMABLE (CONSUMABLE_ID) on delete restrict on update restrict;

alter table PERSON_REPORTS_PROBLEM_ON_CONSUMABLE add constraint FK_PRPOC_PERSON foreign key (PERSON_ID)
      references PERSON (PERSON_ID) on delete restrict on update restrict;

alter table PERSON_REPORTS_PROBLEM_ON_STOCK_ITEM add constraint FK_PRPOSI_PERSON foreign key (PERSON_ID)
      references PERSON (PERSON_ID) on delete restrict on update restrict;

alter table PERSON_REPORTS_PROBLEM_ON_STOCK_ITEM add constraint FK_PERSON_R_PERSON_RE_STOCK_IT foreign key (STOCK_ITEM_ID)
      references STOCK_ITEM (STOCK_ITEM_ID) on delete restrict on update restrict;

alter table PERSON_ROLE_MAPPING add constraint FK_PERSON_ROLE_MAPPING_PERSON foreign key (PERSON_ID)
      references PERSON (PERSON_ID) on delete restrict on update restrict;

alter table PERSON_ROLE_MAPPING add constraint FK_PERSON_ROLE_MAPPING_ROLE foreign key (ROLE_ID)
      references ROLE (ROLE_ID) on delete restrict on update restrict;

alter table ROOM_BELONGS_TO_ORGANIZATIONAL_STRUCTURE add constraint FK_ROOM_BEL_ROOM_BELO_ROOM foreign key (ROOM_ID)
      references ROOM (ROOM_ID) on delete restrict on update restrict;

alter table ROOM_BELONGS_TO_ORGANIZATIONAL_STRUCTURE add constraint FK_ROOM_BEL_ROOM_BELO_ORGANIZA foreign key (ORGANIZATIONAL_STRUCTURE_ID)
      references ORGANIZATIONAL_STRUCTURE (ORGANIZATIONAL_STRUCTURE_ID) on delete restrict on update restrict;

alter table STOCK_ITEM add constraint FK_STOCK_IT_STOCK_ITE_DESTRUCT foreign key (DESTRUCTION_CERTIFICATE_ID)
      references DESTRUCTION_CERTIFICATE (DESTRUCTION_CERTIFICATE_ID) on delete restrict on update restrict;

alter table STOCK_ITEM add constraint FK_STOCK_ITEM_MODEL foreign key (STOCK_ITEM_MODEL_ID)
      references STOCK_ITEM_MODEL (STOCK_ITEM_MODEL_ID) on delete restrict on update restrict;

alter table STOCK_ITEM add constraint FK_STOCK_ITEM_MAINTENANCE foreign key (MAINTENANCE_STEP_ID)
      references MAINTENANCE_STEP (MAINTENANCE_STEP_ID) on delete restrict on update restrict;

alter table STOCK_ITEM_ATTRIBUTE_VALUE add constraint FK_SIAV_STOCK_ITEM foreign key (STOCK_ITEM_ID)
      references STOCK_ITEM (STOCK_ITEM_ID) on delete restrict on update restrict;

alter table STOCK_ITEM_ATTRIBUTE_VALUE add constraint FK_SIAV_ATTRIBUTE_DEF foreign key (STOCK_ITEM_ATTRIBUTE_DEFINITION_ID)
      references STOCK_ITEM_ATTRIBUTE_DEFINITION (STOCK_ITEM_ATTRIBUTE_DEFINITION_ID) on delete restrict on update restrict;

alter table STOCK_ITEM_CONDITION_HISTORY add constraint FK_STOCK_IT_STOCK_ITE_PHYSICAL foreign key (CONDITION_ID)
      references PHYSICAL_CONDITION (CONDITION_ID) on delete restrict on update restrict;

alter table STOCK_ITEM_CONDITION_HISTORY add constraint FK_SICH_STOCK_ITEM foreign key (STOCK_ITEM_ID)
      references STOCK_ITEM (STOCK_ITEM_ID) on delete restrict on update restrict;

alter table STOCK_ITEM_IS_ASSIGNED_TO_PERSON add constraint FK_STOCK_IT_STOCK_ITE_PERSON_ASSIGNED foreign key (ASSIGNED_BY_PERSON_ID)
      references PERSON (PERSON_ID) on delete restrict on update restrict;

alter table STOCK_ITEM_IS_ASSIGNED_TO_PERSON add constraint FK_SIIATP_STOCK_ITEM foreign key (STOCK_ITEM_ID)
      references STOCK_ITEM (STOCK_ITEM_ID) on delete restrict on update restrict;

alter table STOCK_ITEM_IS_ASSIGNED_TO_PERSON add constraint FK_STOCK_IT_STOCK_ITE_PERSON_ASSIGNER foreign key (PERSON_ID)
      references PERSON (PERSON_ID) on delete restrict on update restrict;

alter table STOCK_ITEM_IS_COMPATIBLE_WITH_ASSET add constraint FK_STOCK_IT_STOCK_ITE_ASSET_MO foreign key (ASSET_MODEL_ID)
      references ASSET_MODEL (ASSET_MODEL_ID) on delete restrict on update restrict;

alter table STOCK_ITEM_IS_COMPATIBLE_WITH_ASSET add constraint FK_SIICWA_STOCK_ITEM_MODEL foreign key (STOCK_ITEM_MODEL_ID)
      references STOCK_ITEM_MODEL (STOCK_ITEM_MODEL_ID) on delete restrict on update restrict;

alter table STOCK_ITEM_MODEL add constraint FK_SIM_BRAND foreign key (STOCK_ITEM_BRAND_ID)
      references STOCK_ITEM_BRAND (STOCK_ITEM_BRAND_ID) on delete restrict on update restrict;

alter table STOCK_ITEM_MODEL add constraint FK_SIM_TYPE foreign key (STOCK_ITEM_TYPE_ID)
      references STOCK_ITEM_TYPE (STOCK_ITEM_TYPE_ID) on delete restrict on update restrict;

alter table STOCK_ITEM_MODEL_ATTRIBUTE_VALUE add constraint FK_SIMAV_MODEL foreign key (STOCK_ITEM_MODEL_ID)
      references STOCK_ITEM_MODEL (STOCK_ITEM_MODEL_ID) on delete restrict on update restrict;

alter table STOCK_ITEM_MODEL_ATTRIBUTE_VALUE add constraint FK_SIMAV_ATTRIBUTE_DEF foreign key (STOCK_ITEM_ATTRIBUTE_DEFINITION_ID)
      references STOCK_ITEM_ATTRIBUTE_DEFINITION (STOCK_ITEM_ATTRIBUTE_DEFINITION_ID) on delete restrict on update restrict;

alter table STOCK_ITEM_MODEL_IS_FOUND_IN_BDC add constraint FK_STOCK_IT_STOCK_ITE_BON_DE_C foreign key (BON_DE_COMMANDE_ID)
      references BON_DE_COMMANDE (BON_DE_COMMANDE_ID) on delete restrict on update restrict;

alter table STOCK_ITEM_MODEL_IS_FOUND_IN_BDC add constraint FK_SIMIFIB_MODEL foreign key (STOCK_ITEM_MODEL_ID)
      references STOCK_ITEM_MODEL (STOCK_ITEM_MODEL_ID) on delete restrict on update restrict;

alter table STOCK_ITEM_MOVEMENT add constraint FK_STOCK_IT_STOCK_ITE_EXTERNAL foreign key (EXTERNAL_MAINTENANCE_STEP_ID)
      references EXTERNAL_MAINTENANCE_STEP (EXTERNAL_MAINTENANCE_STEP_ID) on delete restrict on update restrict;

alter table STOCK_ITEM_MOVEMENT add constraint FK_SIM_STOCK_ITEM foreign key (STOCK_ITEM_ID)
      references STOCK_ITEM (STOCK_ITEM_ID) on delete restrict on update restrict;

alter table STOCK_ITEM_MOVEMENT add constraint FK_STOCK_IT_STOCK_ITE_ROOM_SOURCE foreign key (SOURCE_ROOM_ID)
      references ROOM (ROOM_ID) on delete restrict on update restrict;

alter table STOCK_ITEM_MOVEMENT add constraint FK_STOCK_IT_STOCK_ITE_ROOM_DEST foreign key (DESTINATION_ROOM_ID)
      references ROOM (ROOM_ID) on delete restrict on update restrict;

alter table STOCK_ITEM_MOVEMENT add constraint FK_SIM_MAINTENANCE foreign key (MAINTENANCE_STEP_ID)
      references MAINTENANCE_STEP (MAINTENANCE_STEP_ID) on delete restrict on update restrict;

alter table STOCK_ITEM_TYPE_ATTRIBUTE add constraint FK_SITA_TYPE foreign key (STOCK_ITEM_TYPE_ID)
      references STOCK_ITEM_TYPE (STOCK_ITEM_TYPE_ID) on delete restrict on update restrict;

alter table STOCK_ITEM_TYPE_ATTRIBUTE add constraint FK_SITA_ATTRIBUTE_DEF foreign key (STOCK_ITEM_ATTRIBUTE_DEFINITION_ID)
      references STOCK_ITEM_ATTRIBUTE_DEFINITION (STOCK_ITEM_ATTRIBUTE_DEFINITION_ID) on delete restrict on update restrict;

alter table USER_ACCOUNT add constraint FK_USER_ACC_CREATED_BY_USER foreign key (CREATED_BY_USER_ID)
      references USER_ACCOUNT (USER_ID) on delete restrict on update restrict;

alter table USER_ACCOUNT add constraint FK_USER_ACC_MODIFIED_BY_USER foreign key (MODIFIED_BY_USER_ID)
      references USER_ACCOUNT (USER_ID) on delete restrict on update restrict;

alter table USER_ACCOUNT add constraint FK_USER_ACC_PERSON_HA_PERSON foreign key (PERSON_ID)
      references PERSON (PERSON_ID) on delete restrict on update restrict;

alter table USER_SESSION add constraint FK_USER_SES_USER_HAS__USER_ACC foreign key (USER_ID)
      references USER_ACCOUNT (USER_ID) on delete restrict on update restrict;


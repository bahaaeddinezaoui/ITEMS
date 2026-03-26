/*==============================================================*/
/* DBMS name:      MySQL 5.0                                    */
/* Created on:     2/7/2026 3:54:26 PM                          */
/*==============================================================*/


alter table ADMINISTRATIVE_CERTIFICATE 
   drop constraint FK_ADMINIST_AC_IS_LIN_RECEIPT_;

alter table ADMINISTRATIVE_CERTIFICATE 
   drop constraint FK_ADMINIST_AD_IS_BRO_WAREHOUS;

alter table ADMINISTRATIVE_CERTIFICATE 
   drop constraint FK_ADMINIST_AO_LEADS__ATTRIBUT;

/* Removed AO_IS_LINKED_TO_RR constraints */

alter table ASSET 
   drop constraint FK_ASSET_ASSET_IS__DESTRUCT;

alter table ASSET 
   drop constraint FK_ASSET_ASSET_IS__ATTRIBUT;

alter table ASSET 
   drop constraint FK_ASSET_ASSET_IS__ASSET_MO;

alter table ASSET_ATTRIBUTE_VALUE 
   drop constraint FK_ASSET_AT_ASSET_ATT_ASSET;

alter table ASSET_ATTRIBUTE_VALUE 
   drop constraint FK_ASSET_AT_ASSET_ATT_ASSET_AT;

alter table ASSET_CONDITION_HISTORY 
   drop constraint FK_ASSET_CO_ASSET_CON_PHYSICAL;

alter table ASSET_CONDITION_HISTORY 
   drop constraint FK_ASSET_CO_ASSET_HAS_ASSET;

alter table ASSET_IS_ASSIGNED_TO_PERSON 
   drop constraint FK_ASSET_IS_ASSET_IS__PERSON_ASSIGNED;

alter table ASSET_IS_ASSIGNED_TO_PERSON 
   drop constraint FK_ASSET_IS_ASSET_IS__PERSON_ASSIGNER;

alter table ASSET_IS_ASSIGNED_TO_PERSON 
   drop constraint FK_ASSET_IS_ASSET_IS__ASSET;

alter table ASSET_IS_COMPOSED_OF_CONSUMABLE_HISTORY 
   drop constraint FK_ASSET_IS_ASSET_IS__ASSET;

alter table ASSET_IS_COMPOSED_OF_CONSUMABLE_HISTORY 
   drop constraint FK_ASSET_IS_ASSET_IS__CONSUMAB;

alter table ASSET_IS_COMPOSED_OF_CONSUMABLE_HISTORY 
   drop constraint FK_ASSET_IS_ASSET_IS__MAINTENA;

alter table ASSET_IS_COMPOSED_OF_STOCK_ITEMS_HISTORY 
   drop constraint FK_ASSET_IS_ASSET_IS__MAINTENA;

alter table ASSET_IS_COMPOSED_OF_STOCK_ITEMS_HISTORY 
   drop constraint FK_ASSET_IS_ASSET_IS__ASSET;

alter table ASSET_IS_COMPOSED_OF_STOCK_ITEMS_HISTORY 
   drop constraint FK_ASSET_IS_ASSET_IS__STOCK_IT;

alter table ASSET_MODEL 
   drop constraint FK_ASSET_MO_ASSET_MOD_ASSET_BR;

alter table ASSET_MODEL 
   drop constraint FK_ASSET_MO_ASSET_TYP_ASSET_TY;

alter table ASSET_MODEL_ATTRIBUTE_VALUE 
   drop constraint FK_ASSET_MO_ASSET_MOD_ASSET_AT;

alter table ASSET_MODEL_ATTRIBUTE_VALUE 
   drop constraint FK_ASSET_MO_ASSET_MOD_ASSET_MO;

alter table ASSET_MOVEMENT 
   drop constraint FK_ASSET_MO_ASSET_MOV_EXTERNAL;

alter table ASSET_MOVEMENT 
   drop constraint FK_ASSET_MO_ASSET_MOV_ASSET;

alter table ASSET_MOVEMENT 
   drop constraint FK_ASSET_MO_ASSET_MOV_ROOM_SOURCE;

alter table ASSET_MOVEMENT 
   drop constraint FK_ASSET_MO_ASSET_MOV_ROOM_DEST;

alter table ASSET_MOVEMENT 
   drop constraint FK_ASSET_MO_ASSET_MOV_MAINTENA;

alter table ASSET_TYPE_ATTRIBUTE 
   drop constraint FK_ASSET_TY_ASSET_TYP_ASSET_TY;

alter table ASSET_TYPE_ATTRIBUTE 
   drop constraint FK_ASSET_TY_ASSET_TYP_ASSET_AT;

alter table ATTRIBUTION_ORDER 
   drop constraint FK_ATTRIBUT_SHIPMENT__WAREHOUS;

alter table AUTHENTICATION_LOG 
   drop constraint FK_AUTHENTI_USER_HAS__USER_ACC;

alter table BON_DE_COMMANDE 
   drop constraint FK_BON_DE_C_BDC_IS_MA_SUPPLIER;

alter table BON_DE_LIVRAISON 
   drop constraint FK_BON_DE_L_BON_DE_CO_BON_DE_C;

alter table BON_DE_RESTE 
   drop constraint FK_BON_DE_R_BDC_HAS_B_BON_DE_C;

alter table COMPANY_ASSET_REQUEST 
   drop constraint FK_COMPANY__AO_LEADS__ATTRIBUT;

/* Removed COMPANY_ASSET_REQUEST_IS_LINKED_TO_RECEIPT_REPORT constraints */

alter table CONSUMABLE 
   drop constraint FK_CONSUMAB_CONSUMABL_DESTRUCT;

alter table CONSUMABLE 
   drop constraint FK_CONSUMABLE_MODEL;

alter table CONSUMABLE_ATTRIBUTE_VALUE 
   drop constraint FK_CAV_ATTRIBUTE_DEF;

alter table CONSUMABLE_ATTRIBUTE_VALUE 
   drop constraint FK_CAV_CONSUMABLE;

alter table CONSUMABLE_CONDITION_HISTORY 
   drop constraint FK_CONSUMAB_ASSOCIATI_CONSUMAB;

alter table CONSUMABLE_CONDITION_HISTORY_HAS_PHYSICAL_CONDITION 
   drop constraint FK_CONSUMAB_CONSUMABL_PHYSICAL;

alter table CONSUMABLE_CONDITION_HISTORY_HAS_PHYSICAL_CONDITION 
   drop constraint FK_CCHHPC_HISTORY;

alter table CONSUMABLE_IS_ASSIGNED_TO_PERSON 
   drop constraint FK_CONSUMAB_CONSUMABL_PERSON_ASSIGNED;

alter table CONSUMABLE_IS_ASSIGNED_TO_PERSON 
   drop constraint FK_CIATP_CONSUMABLE;

alter table CONSUMABLE_IS_ASSIGNED_TO_PERSON 
   drop constraint FK_CONSUMAB_CONSUMABL_PERSON_ASSIGNER;

alter table CONSUMABLE_IS_USED_IN_STOCK_ITEM_HISTORY 
   drop constraint FK_CIUISIH_CONSUMABLE;

alter table CONSUMABLE_IS_USED_IN_STOCK_ITEM_HISTORY 
   drop constraint FK_CIUISIH_MAINTENANCE;

alter table CONSUMABLE_IS_USED_IN_STOCK_ITEM_HISTORY 
   drop constraint FK_CONSUMAB_CONSUMABL_STOCK_IT;

alter table CONSUMABLE_MODEL 
   drop constraint FK_CM_BRAND;

alter table CONSUMABLE_MODEL 
   drop constraint FK_CM_TYPE;

alter table CONSUMABLE_MODEL_ATTRIBUTE_VALUE 
   drop constraint FK_CMAV_ATTRIBUTE_DEF;

alter table CONSUMABLE_MODEL_ATTRIBUTE_VALUE 
   drop constraint FK_CMAV_MODEL;

alter table CONSUMABLE_MODEL_IS_FOUND_IN_BDC 
   drop constraint FK_CONSUMAB_CONSUMABL_BON_DE_C;

alter table CONSUMABLE_MODEL_IS_FOUND_IN_BDC 
   drop constraint FK_CMIFIB_MODEL;

alter table CONSUMABLE_MOVEMENT 
   drop constraint FK_CM_CONSUMABLE;

alter table CONSUMABLE_MOVEMENT 
   drop constraint FK_CONSUMAB_CONSUMABL_ROOM_DEST;

alter table CONSUMABLE_MOVEMENT 
   drop constraint FK_CONSUMAB_CONSUMABL_ROOM_SOURCE;

alter table CONSUMABLE_MOVEMENT 
   drop constraint FK_CM_MAINTENANCE;

alter table CONSUMABLE_MOVEMENT 
   drop constraint FK_CONSUMAB_CONSUMABL_EXTERNAL;

alter table CONSUMABLE_TYPE_ATTRIBUTE 
   drop constraint FK_CTA_ATTRIBUTE_DEF;

alter table CONSUMABLE_TYPE_ATTRIBUTE 
   drop constraint FK_CTA_TYPE;

alter table C_IS_COMPATIBLE_WITH_A 
   drop constraint FK_C_IS_COM_C_IS_COMP_ASSET_MO;

alter table C_IS_COMPATIBLE_WITH_A 
   drop constraint FK_CICWA_CONSUMABLE_MODEL;

alter table C_IS_COMPATIBLE_WITH_SI 
   drop constraint FK_C_IS_COM_C_IS_COMP_STOCK_IT;

alter table C_IS_COMPATIBLE_WITH_SI 
   drop constraint FK_CICWSI_CONSUMABLE_MODEL;

alter table EXTERNAL_MAINTENANCE 
   drop constraint FK_EXTERNAL_MAINTENAN_MAINTENA;

alter table EXTERNAL_MAINTENANCE_DOCUMENT 
   drop constraint FK_EMD_EXTERNAL_MAINTENANCE;

alter table EXTERNAL_MAINTENANCE_STEP 
   drop constraint FK_EXTERNAL_EMS_IS_A__EXTERNAL;

alter table EXTERNAL_MAINTENANCE_STEP 
   drop constraint FK_EMS_EXTERNAL_MAINTENANCE;

alter table EXTERNAL_MAINTENANCE_STEP 
   drop constraint FK_EMS_PROVIDER;

alter table FACTURE 
   drop constraint FK_FACTURE_BON_DE_LI_BON_DE_L;

alter table MAINTENANCE 
   drop constraint FK_MAINTENA_ASSET_IS__ASSET;

alter table MAINTENANCE 
   drop constraint FK_MAINTENA_MAINTENAN_PERSON;

alter table MAINTENANCE 
   drop constraint FK_MAINTENA_PERSON_AS_PERSON;

alter table MAINTENANCE 
   drop constraint FK_MAINTENANCE_ASSIGNED_PERSON;

alter table MAINTENANCE_INSPECTION_LEADS_TO_BROKEN_ITEM_REPORT 
   drop constraint FK_MAINTENA_MAINTENAN_BROKEN_I;

alter table MAINTENANCE_INSPECTION_LEADS_TO_BROKEN_ITEM_REPORT 
   drop constraint FK_MILBIR_MAINTENANCE;

alter table MAINTENANCE_STEP 
   drop constraint FK_MAINTENA_ASSET_CON_ASSET_CO;

alter table MAINTENANCE_STEP 
   drop constraint FK_MAINTENA_CONSUMABL_CONSUMAB;

alter table MAINTENANCE_STEP 
   drop constraint FK_MS_MAINTENANCE;

alter table MAINTENANCE_STEP 
   drop constraint FK_MS_TYPICAL_STEP;

alter table MAINTENANCE_STEP 
   drop constraint FK_MS_PERSON;

alter table MAINTENANCE_STEP 
   drop constraint FK_MAINTENA_STOCK_ITE_STOCK_IT;

alter table ORGANIZATIONAL_STRUCTURE_RELATION 
   drop constraint FK_ORGANIZA_ORGANIZAT_ORGANIZA_PARENT;

alter table ORGANIZATIONAL_STRUCTURE_RELATION 
   drop constraint FK_ORGANIZA_ORGANIZAT_ORGANIZA_CHILD;

alter table PERSON_ASSIGNMENT 
   drop constraint FK_PERSON_A_PERSON_HA_PERSON;

alter table PERSON_ASSIGNMENT 
   drop constraint FK_PERSON_A_PERSON_IS_POSITION;

alter table PERSON_REPORTS_PROBLEM_ON_ASSET 
   drop constraint FK_PERSON_R_PERSON_RE_ASSET;

alter table PERSON_REPORTS_PROBLEM_ON_ASSET 
   drop constraint FK_PRPOA_PERSON;

alter table PERSON_REPORTS_PROBLEM_ON_CONSUMABLE 
   drop constraint FK_PERSON_R_PERSON_RE_CONSUMAB;

alter table PERSON_REPORTS_PROBLEM_ON_CONSUMABLE 
   drop constraint FK_PRPOC_PERSON;

alter table PERSON_REPORTS_PROBLEM_ON_STOCK_ITEM 
   drop constraint FK_PRPOSI_PERSON;

alter table PERSON_REPORTS_PROBLEM_ON_STOCK_ITEM 
   drop constraint FK_PERSON_R_PERSON_RE_STOCK_IT;

alter table PERSON_ROLE_MAPPING 
   drop constraint FK_PERSON_ROLE_MAPPING_PERSON;

alter table PERSON_ROLE_MAPPING 
   drop constraint FK_PERSON_ROLE_MAPPING_ROLE;

alter table ROOM_BELONGS_TO_ORGANIZATIONAL_STRUCTURE 
   drop constraint FK_ROOM_BEL_ROOM_BELO_ROOM;

alter table ROOM_BELONGS_TO_ORGANIZATIONAL_STRUCTURE 
   drop constraint FK_ROOM_BEL_ROOM_BELO_ORGANIZA;

alter table STOCK_ITEM 
   drop constraint FK_STOCK_IT_STOCK_ITE_DESTRUCT;

alter table STOCK_ITEM 
   drop constraint FK_STOCK_ITEM_MODEL;

alter table STOCK_ITEM 
   drop constraint FK_STOCK_ITEM_MAINTENANCE;

alter table STOCK_ITEM_ATTRIBUTE_VALUE 
   drop constraint FK_SIAV_STOCK_ITEM;

alter table STOCK_ITEM_ATTRIBUTE_VALUE 
   drop constraint FK_SIAV_ATTRIBUTE_DEF;

alter table STOCK_ITEM_CONDITION_HISTORY 
   drop constraint FK_STOCK_IT_STOCK_ITE_PHYSICAL;

alter table STOCK_ITEM_CONDITION_HISTORY 
   drop constraint FK_SICH_STOCK_ITEM;

alter table STOCK_ITEM_IS_ASSIGNED_TO_PERSON 
   drop constraint FK_STOCK_IT_STOCK_ITE_PERSON_ASSIGNED;

alter table STOCK_ITEM_IS_ASSIGNED_TO_PERSON 
   drop constraint FK_SIIATP_STOCK_ITEM;

alter table STOCK_ITEM_IS_ASSIGNED_TO_PERSON 
   drop constraint FK_STOCK_IT_STOCK_ITE_PERSON_ASSIGNER;

alter table STOCK_ITEM_IS_COMPATIBLE_WITH_ASSET 
   drop constraint FK_STOCK_IT_STOCK_ITE_ASSET_MO;

alter table STOCK_ITEM_IS_COMPATIBLE_WITH_ASSET 
   drop constraint FK_SIICWA_STOCK_ITEM_MODEL;

alter table STOCK_ITEM_MODEL 
   drop constraint FK_SIM_BRAND;

alter table STOCK_ITEM_MODEL 
   drop constraint FK_SIM_TYPE;

alter table STOCK_ITEM_MODEL_ATTRIBUTE_VALUE 
   drop constraint FK_SIMAV_MODEL;

alter table STOCK_ITEM_MODEL_ATTRIBUTE_VALUE 
   drop constraint FK_SIMAV_ATTRIBUTE_DEF;

alter table STOCK_ITEM_MODEL_IS_FOUND_IN_BDC 
   drop constraint FK_STOCK_IT_STOCK_ITE_BON_DE_C;

alter table STOCK_ITEM_MODEL_IS_FOUND_IN_BDC 
   drop constraint FK_SIMIFIB_MODEL;

alter table STOCK_ITEM_MOVEMENT 
   drop constraint FK_STOCK_IT_STOCK_ITE_EXTERNAL;

alter table STOCK_ITEM_MOVEMENT 
   drop constraint FK_SIM_STOCK_ITEM;

alter table STOCK_ITEM_MOVEMENT 
   drop constraint FK_STOCK_IT_STOCK_ITE_ROOM_SOURCE;

alter table STOCK_ITEM_MOVEMENT 
   drop constraint FK_STOCK_IT_STOCK_ITE_ROOM_DEST;

alter table STOCK_ITEM_MOVEMENT 
   drop constraint FK_SIM_MAINTENANCE;

alter table STOCK_ITEM_TYPE_ATTRIBUTE 
   drop constraint FK_SITA_TYPE;

alter table STOCK_ITEM_TYPE_ATTRIBUTE 
   drop constraint FK_SITA_ATTRIBUTE_DEF;

alter table SUPERUSER_CREATES_ACCOUNT 
   drop constraint FK_SUPERUSE_SUPERUSER_USER_ACC;

alter table SUPERUSER_CREATES_ACCOUNT 
   drop constraint FK_SUPERUSE_SUPERUSER_USER_ACC;

alter table SUPERUSER_MODIFIES_ACCOUNT 
   drop constraint FK_SUPERUSE_SUPERUSER_USER_ACC;

alter table SUPERUSER_MODIFIES_ACCOUNT 
   drop constraint FK_SUPERUSE_SUPERUSER_USER_ACC;

alter table USER_ACCOUNT 
   drop constraint FK_USER_ACC_PERSON_HA_PERSON;

alter table USER_ACCOUNT 
   drop constraint FK_USER_ACC_CREATED_BY_USER;

alter table USER_ACCOUNT 
   drop constraint FK_USER_ACC_MODIFIED_BY_USER;

alter table USER_SESSION 
   drop constraint FK_USER_SES_USER_HAS__USER_ACC;


alter table ADMINISTRATIVE_CERTIFICATE 
   drop constraint FK_ADMINIST_AD_IS_BRO_WAREHOUS;

alter table ADMINISTRATIVE_CERTIFICATE 
   drop constraint FK_ADMINIST_AO_LEADS__ATTRIBUT;

alter table ADMINISTRATIVE_CERTIFICATE 
   drop constraint FK_ADMINIST_AC_IS_LIN_RECEIPT_;

drop table if exists ADMINISTRATIVE_CERTIFICATE;


/* Removed drop table if exists AO_IS_LINKED_TO_RR; */


alter table ASSET 
   drop constraint FK_ASSET_ASSET_IS__ASSET_MO;

alter table ASSET 
   drop constraint FK_ASSET_ASSET_IS__ATTRIBUT;

alter table ASSET 
   drop constraint FK_ASSET_ASSET_IS__DESTRUCT;

drop table if exists ASSET;

drop table if exists ASSET_ATTRIBUTE_DEFINITION;


alter table ASSET_ATTRIBUTE_VALUE 
   drop constraint FK_ASSET_AT_ASSET_ATT_ASSET_AT;

alter table ASSET_ATTRIBUTE_VALUE 
   drop constraint FK_ASSET_AT_ASSET_ATT_ASSET;

drop table if exists ASSET_ATTRIBUTE_VALUE;

drop table if exists ASSET_BRAND;


alter table ASSET_CONDITION_HISTORY 
   drop constraint FK_ASSET_CO_ASSET_HAS_ASSET;

alter table ASSET_CONDITION_HISTORY 
   drop constraint FK_ASSET_CO_ASSET_CON_PHYSICAL;

drop table if exists ASSET_CONDITION_HISTORY;


alter table ASSET_IS_ASSIGNED_TO_PERSON 
   drop constraint FK_ASSET_IS_ASSET_IS__PERSON;

alter table ASSET_IS_ASSIGNED_TO_PERSON 
   drop constraint FK_AIATP_ASSET;

alter table ASSET_IS_ASSIGNED_TO_PERSON 
   drop constraint FK_ASSET_IS_ASSET_IS__PERSON;

drop table if exists ASSET_IS_ASSIGNED_TO_PERSON;


alter table ASSET_IS_COMPOSED_OF_CONSUMABLE_HISTORY 
   drop constraint FK_ASSET_IS_ASSET_IS__CONSUMAB;

alter table ASSET_IS_COMPOSED_OF_CONSUMABLE_HISTORY 
   drop constraint FK_AICOC_ASSET;

alter table ASSET_IS_COMPOSED_OF_CONSUMABLE_HISTORY 
   drop constraint FK_AICOC_MAINTENANCE_STEP;

drop table if exists ASSET_IS_COMPOSED_OF_CONSUMABLE_HISTORY;


alter table ASSET_IS_COMPOSED_OF_STOCK_ITEMS_HISTORY 
   drop constraint FK_ASSET_IS_ASSET_IS__STOCK_IT;

alter table ASSET_IS_COMPOSED_OF_STOCK_ITEMS_HISTORY 
   drop constraint FK_AICOSI_ASSET;

alter table ASSET_IS_COMPOSED_OF_STOCK_ITEMS_HISTORY 
   drop constraint FK_AICOSI_MAINTENANCE_STEP;

drop table if exists ASSET_IS_COMPOSED_OF_STOCK_ITEMS_HISTORY;


alter table ASSET_MODEL 
   drop constraint FK_ASSET_MO_ASSET_MOD_ASSET_BR;

alter table ASSET_MODEL 
   drop constraint FK_ASSET_MO_ASSET_TYP_ASSET_TY;

drop table if exists ASSET_MODEL;


alter table ASSET_MODEL_ATTRIBUTE_VALUE 
   drop constraint FK_ASSET_MO_ASSET_MOD_ASSET_MO;

alter table ASSET_MODEL_ATTRIBUTE_VALUE 
   drop constraint FK_ASSET_MO_ASSET_MOD_ASSET_AT;

drop table if exists ASSET_MODEL_ATTRIBUTE_VALUE;


alter table ASSET_MOVEMENT 
   drop constraint FK_ASSET_MO_ASSET_MOV_ASSET;

alter table ASSET_MOVEMENT 
   drop constraint FK_ASSET_MO_ASSET_MOV_ROOM_SOURCE;

alter table ASSET_MOVEMENT 
   drop constraint FK_ASSET_MO_ASSET_MOV_ROOM_DEST;

alter table ASSET_MOVEMENT 
   drop constraint FK_ASSET_MO_ASSET_MOV_MAINTENA;

alter table ASSET_MOVEMENT 
   drop constraint FK_ASSET_MO_ASSET_MOV_EXTERNAL;

drop table if exists ASSET_MOVEMENT;

drop table if exists ASSET_TYPE;


alter table ASSET_TYPE_ATTRIBUTE 
   drop constraint FK_ASSET_TY_ASSET_TYP_ASSET_AT;

alter table ASSET_TYPE_ATTRIBUTE 
   drop constraint FK_ASSET_TY_ASSET_TYP_ASSET_TY;

drop table if exists ASSET_TYPE_ATTRIBUTE;


alter table ATTRIBUTION_ORDER 
   drop constraint FK_ATTRIBUT_SHIPMENT__WAREHOUS;

drop table if exists ATTRIBUTION_ORDER;


alter table AUTHENTICATION_LOG 
   drop constraint FK_AUTHENTI_USER_HAS__USER_ACC;

drop table if exists AUTHENTICATION_LOG;


alter table BON_DE_COMMANDE 
   drop constraint FK_BON_DE_C_BDC_IS_MA_SUPPLIER;

drop table if exists BON_DE_COMMANDE;


alter table BON_DE_LIVRAISON 
   drop constraint FK_BON_DE_L_BON_DE_CO_BON_DE_C;

drop table if exists BON_DE_LIVRAISON;


alter table BON_DE_RESTE 
   drop constraint FK_BON_DE_R_BDC_HAS_B_BON_DE_C;

drop table if exists BON_DE_RESTE;

drop table if exists BROKEN_ITEM_REPORT;


alter table COMPANY_ASSET_REQUEST 
   drop constraint FK_COMPANY__AO_LEADS__ATTRIBUT;

drop table if exists COMPANY_ASSET_REQUEST;


/* Removed drop table if exists COMPANY_ASSET_REQUEST_IS_LINKED_TO_RECEIPT_REPORT; */


alter table CONSUMABLE 
   drop constraint FK_CONSUMAB_CONSUMABL_CONSUMAB;

alter table CONSUMABLE 
   drop constraint FK_CONSUMAB_CONSUMABL_DESTRUCT;

drop table if exists CONSUMABLE;

drop table if exists CONSUMABLE_ATTRIBUTE_DEFINITION;


alter table CONSUMABLE_ATTRIBUTE_VALUE 
   drop constraint FK_CONSUMAB_CONSUMABL_CONSUMAB;

alter table CONSUMABLE_ATTRIBUTE_VALUE 
   drop constraint FK_CONSUMAB_CONSUMABL_CONSUMAB;

drop table if exists CONSUMABLE_ATTRIBUTE_VALUE;

drop table if exists CONSUMABLE_BRAND;


alter table CONSUMABLE_CONDITION_HISTORY 
   drop constraint FK_CONSUMAB_ASSOCIATI_CONSUMAB;

drop table if exists CONSUMABLE_CONDITION_HISTORY;


alter table CONSUMABLE_CONDITION_HISTORY_HAS_PHYSICAL_CONDITION 
   drop constraint FK_CONSUMAB_CONSUMABL_CONSUMAB;

alter table CONSUMABLE_CONDITION_HISTORY_HAS_PHYSICAL_CONDITION 
   drop constraint FK_CONSUMAB_CONSUMABL_PHYSICAL;

drop table if exists CONSUMABLE_CONDITION_HISTORY_HAS_PHYSICAL_CONDITION;


alter table CONSUMABLE_IS_ASSIGNED_TO_PERSON 
   drop constraint FK_CONSUMAB_CONSUMABL_PERSON_ASSIGNED;

alter table CONSUMABLE_IS_ASSIGNED_TO_PERSON 
   drop constraint FK_CONSUMAB_CONSUMABL_CONSUMAB;

alter table CONSUMABLE_IS_ASSIGNED_TO_PERSON 
   drop constraint FK_CONSUMAB_CONSUMABL_PERSON_ASSIGNER;

drop table if exists CONSUMABLE_IS_ASSIGNED_TO_PERSON;


alter table CONSUMABLE_IS_USED_IN_STOCK_ITEM_HISTORY 
   drop constraint FK_CONSUMAB_CONSUMABL_CONSUMAB;

alter table CONSUMABLE_IS_USED_IN_STOCK_ITEM_HISTORY 
   drop constraint FK_CONSUMAB_CONSUMABL_STOCK_IT;

alter table CONSUMABLE_IS_USED_IN_STOCK_ITEM_HISTORY 
   drop constraint FK_CONSUMAB_CONSUMABL_MAINTENA;

drop table if exists CONSUMABLE_IS_USED_IN_STOCK_ITEM_HISTORY;


alter table CONSUMABLE_MODEL 
   drop constraint FK_CONSUMAB_CONSUMABL_CONSUMAB;

alter table CONSUMABLE_MODEL 
   drop constraint FK_CONSUMAB_CONSUMABL_CONSUMAB;

drop table if exists CONSUMABLE_MODEL;


alter table CONSUMABLE_MODEL_ATTRIBUTE_VALUE 
   drop constraint FK_CONSUMAB_CONSUMABL_CONSUMAB;

alter table CONSUMABLE_MODEL_ATTRIBUTE_VALUE 
   drop constraint FK_CONSUMAB_CONSUMABL_CONSUMAB;

drop table if exists CONSUMABLE_MODEL_ATTRIBUTE_VALUE;


alter table CONSUMABLE_MODEL_IS_FOUND_IN_BDC 
   drop constraint FK_CONSUMAB_CONSUMABL_CONSUMAB;

alter table CONSUMABLE_MODEL_IS_FOUND_IN_BDC 
   drop constraint FK_CONSUMAB_CONSUMABL_BON_DE_C;

drop table if exists CONSUMABLE_MODEL_IS_FOUND_IN_BDC;


alter table CONSUMABLE_MOVEMENT 
   drop constraint FK_CONSUMAB_CONSUMABL_CONSUMAB;

alter table CONSUMABLE_MOVEMENT 
   drop constraint FK_CONSUMAB_CONSUMABL_ROOM_DEST;

alter table CONSUMABLE_MOVEMENT 
   drop constraint FK_CONSUMAB_CONSUMABL_ROOM_SOURCE;

alter table CONSUMABLE_MOVEMENT 
   drop constraint FK_CONSUMAB_CONSUMABL_MAINTENA;

alter table CONSUMABLE_MOVEMENT 
   drop constraint FK_CONSUMAB_CONSUMABL_EXTERNAL;

drop table if exists CONSUMABLE_MOVEMENT;

drop table if exists CONSUMABLE_TYPE;


alter table CONSUMABLE_TYPE_ATTRIBUTE 
   drop constraint FK_CONSUMAB_CONSUMABL_CONSUMAB;

alter table CONSUMABLE_TYPE_ATTRIBUTE 
   drop constraint FK_CONSUMAB_CONSUMABL_CONSUMAB;

drop table if exists CONSUMABLE_TYPE_ATTRIBUTE;


alter table C_IS_COMPATIBLE_WITH_A 
   drop constraint FK_C_IS_COM_C_IS_COMP_CONSUMAB;

alter table C_IS_COMPATIBLE_WITH_A 
   drop constraint FK_C_IS_COM_C_IS_COMP_ASSET_MO;

drop table if exists C_IS_COMPATIBLE_WITH_A;


alter table C_IS_COMPATIBLE_WITH_SI 
   drop constraint FK_C_IS_COM_C_IS_COMP_CONSUMAB;

alter table C_IS_COMPATIBLE_WITH_SI 
   drop constraint FK_C_IS_COM_C_IS_COMP_STOCK_IT;

drop table if exists C_IS_COMPATIBLE_WITH_SI;

drop table if exists DESTRUCTION_CERTIFICATE;


alter table EXTERNAL_MAINTENANCE 
   drop constraint FK_EXTERNAL_MAINTENAN_MAINTENA;

drop table if exists EXTERNAL_MAINTENANCE;


alter table EXTERNAL_MAINTENANCE_DOCUMENT 
   drop constraint FK_EXTERNAL_EXTERNAL__EXTERNAL;

drop table if exists EXTERNAL_MAINTENANCE_DOCUMENT;

drop table if exists EXTERNAL_MAINTENANCE_PROVIDER;


alter table EXTERNAL_MAINTENANCE_STEP 
   drop constraint FK_EXTERNAL_EXTERNAL__EXTERNAL;

alter table EXTERNAL_MAINTENANCE_STEP 
   drop constraint FK_EXTERNAL_EXTERNAL__EXTERNAL;

alter table EXTERNAL_MAINTENANCE_STEP 
   drop constraint FK_EXTERNAL_EMS_IS_A__EXTERNAL;

drop table if exists EXTERNAL_MAINTENANCE_STEP;

drop table if exists EXTERNAL_MAINTENANCE_TYPICAL_STEP;


alter table FACTURE 
   drop constraint FK_FACTURE_BON_DE_LI_BON_DE_L;

drop table if exists FACTURE;


alter table MAINTENANCE 
   drop constraint FK_MAINTENA_ASSET_IS__ASSET;

alter table MAINTENANCE 
   drop constraint FK_MAINTENA_PERSON_IS_PERSON;

alter table MAINTENANCE 
   drop constraint FK_MAINTENA_MAINTENAN_PERSON;

alter table MAINTENANCE 
   drop constraint FK_MAINTENA_PERSON_AS_PERSON;

drop table if exists MAINTENANCE;


alter table MAINTENANCE_INSPECTION_LEADS_TO_BROKEN_ITEM_REPORT 
   drop constraint FK_MAINTENA_MAINTENAN_MAINTENA;

alter table MAINTENANCE_INSPECTION_LEADS_TO_BROKEN_ITEM_REPORT 
   drop constraint FK_MAINTENA_MAINTENAN_BROKEN_I;

drop table if exists MAINTENANCE_INSPECTION_LEADS_TO_BROKEN_ITEM_REPORT;


alter table MAINTENANCE_STEP 
   drop constraint FK_MAINTENA_MAINTENAN_MAINTENA;

alter table MAINTENANCE_STEP 
   drop constraint FK_MAINTENA_MAINTENAN_MAINTENA;

alter table MAINTENANCE_STEP 
   drop constraint FK_MAINTENA_PERSON_IS_PERSON;

alter table MAINTENANCE_STEP 
   drop constraint FK_MAINTENA_ASSET_CON_ASSET_CO;

alter table MAINTENANCE_STEP 
   drop constraint FK_MAINTENA_STOCK_ITE_STOCK_IT;

alter table MAINTENANCE_STEP 
   drop constraint FK_MAINTENA_CONSUMABL_CONSUMAB;

drop table if exists MAINTENANCE_STEP;

drop table if exists MAINTENANCE_TYPICAL_STEP;

drop table if exists ORGANIZATIONAL_STRUCTURE;


alter table ORGANIZATIONAL_STRUCTURE_RELATION 
   drop constraint FK_ORGANIZA_ORGANIZAT_ORGANIZA_PARENT;

alter table ORGANIZATIONAL_STRUCTURE_RELATION 
   drop constraint FK_ORGANIZA_ORGANIZAT_ORGANIZA_CHILD;

drop table if exists ORGANIZATIONAL_STRUCTURE_RELATION;

drop table if exists PERSON;


alter table PERSON_ASSIGNMENT 
   drop constraint FK_PERSON_A_PERSON_IS_POSITION;

alter table PERSON_ASSIGNMENT 
   drop constraint FK_PERSON_A_PERSON_HA_PERSON;

drop table if exists PERSON_ASSIGNMENT;


alter table PERSON_REPORTS_PROBLEM_ON_ASSET 
   drop constraint FK_PERSON_R_PERSON_RE_ASSET;

alter table PERSON_REPORTS_PROBLEM_ON_ASSET 
   drop constraint FK_PERSON_R_PERSON_RE_PERSON;

drop table if exists PERSON_REPORTS_PROBLEM_ON_ASSET;


alter table PERSON_REPORTS_PROBLEM_ON_CONSUMABLE 
   drop constraint FK_PERSON_R_PERSON_RE_PERSON;

alter table PERSON_REPORTS_PROBLEM_ON_CONSUMABLE 
   drop constraint FK_PERSON_R_PERSON_RE_CONSUMAB;

drop table if exists PERSON_REPORTS_PROBLEM_ON_CONSUMABLE;


alter table PERSON_REPORTS_PROBLEM_ON_STOCK_ITEM 
   drop constraint FK_PERSON_R_PERSON_RE_PERSON;

alter table PERSON_REPORTS_PROBLEM_ON_STOCK_ITEM 
   drop constraint FK_PERSON_R_PERSON_RE_STOCK_IT;

drop table if exists PERSON_REPORTS_PROBLEM_ON_STOCK_ITEM;

drop table if exists PHYSICAL_CONDITION;

drop table if exists POSITION;


alter table POSITION_ROLE_MAPPING 
   drop constraint FK_POSITION_POSITION__ROLE;

alter table POSITION_ROLE_MAPPING 
   drop constraint FK_POSITION_POSITION__PERSON;

drop table if exists PERSON_ROLE_MAPPING;

drop table if exists RECEIPT_REPORT;

drop table if exists ROLE;

drop table if exists ROOM;


alter table ROOM_BELONGS_TO_ORGANIZATIONAL_STRUCTURE 
   drop constraint FK_ROOM_BEL_ROOM_BELO_ORGANIZA;

alter table ROOM_BELONGS_TO_ORGANIZATIONAL_STRUCTURE 
   drop constraint FK_ROOM_BEL_ROOM_BELO_ROOM;

drop table if exists ROOM_BELONGS_TO_ORGANIZATIONAL_STRUCTURE;


alter table STOCK_ITEM 
   drop constraint FK_STOCK_IT_STOCK_ITE_MAINTENA;

alter table STOCK_ITEM 
   drop constraint FK_STOCK_IT_STOCK_ITE_STOCK_IT;

alter table STOCK_ITEM 
   drop constraint FK_STOCK_IT_STOCK_ITE_DESTRUCT;

drop table if exists STOCK_ITEM;

drop table if exists STOCK_ITEM_ATTRIBUTE_DEFINITION;


alter table STOCK_ITEM_ATTRIBUTE_VALUE 
   drop constraint FK_STOCK_IT_STOCK_ITE_STOCK_IT;

alter table STOCK_ITEM_ATTRIBUTE_VALUE 
   drop constraint FK_STOCK_IT_STOCK_ITE_STOCK_IT;

drop table if exists STOCK_ITEM_ATTRIBUTE_VALUE;

drop table if exists STOCK_ITEM_BRAND;


alter table STOCK_ITEM_CONDITION_HISTORY 
   drop constraint FK_STOCK_IT_STOCK_ITE_STOCK_IT;

alter table STOCK_ITEM_CONDITION_HISTORY 
   drop constraint FK_STOCK_IT_STOCK_ITE_PHYSICAL;

drop table if exists STOCK_ITEM_CONDITION_HISTORY;


alter table STOCK_ITEM_IS_ASSIGNED_TO_PERSON 
   drop constraint FK_STOCK_IT_STOCK_ITE_STOCK_IT;

alter table STOCK_ITEM_IS_ASSIGNED_TO_PERSON 
   drop constraint FK_STOCK_IT_STOCK_ITE_PERSON_ASSIGNED;

alter table STOCK_ITEM_IS_ASSIGNED_TO_PERSON 
   drop constraint FK_STOCK_IT_STOCK_ITE_PERSON_ASSIGNER;

drop table if exists STOCK_ITEM_IS_ASSIGNED_TO_PERSON;


alter table STOCK_ITEM_IS_COMPATIBLE_WITH_ASSET 
   drop constraint FK_STOCK_IT_STOCK_ITE_STOCK_IT;

alter table STOCK_ITEM_IS_COMPATIBLE_WITH_ASSET 
   drop constraint FK_STOCK_IT_STOCK_ITE_ASSET_MO;

drop table if exists STOCK_ITEM_IS_COMPATIBLE_WITH_ASSET;


alter table STOCK_ITEM_MODEL 
   drop constraint FK_STOCK_IT_STOCK_ITE_STOCK_IT;

alter table STOCK_ITEM_MODEL 
   drop constraint FK_STOCK_IT_STOCK_ITE_STOCK_IT;

drop table if exists STOCK_ITEM_MODEL;


alter table STOCK_ITEM_MODEL_ATTRIBUTE_VALUE 
   drop constraint FK_STOCK_IT_STOCK_ITE_STOCK_IT;

alter table STOCK_ITEM_MODEL_ATTRIBUTE_VALUE 
   drop constraint FK_STOCK_IT_STOCK_ITE_STOCK_IT;

drop table if exists STOCK_ITEM_MODEL_ATTRIBUTE_VALUE;


alter table STOCK_ITEM_MODEL_IS_FOUND_IN_BDC 
   drop constraint FK_STOCK_IT_STOCK_ITE_STOCK_IT;

alter table STOCK_ITEM_MODEL_IS_FOUND_IN_BDC 
   drop constraint FK_STOCK_IT_STOCK_ITE_BON_DE_C;

drop table if exists STOCK_ITEM_MODEL_IS_FOUND_IN_BDC;


alter table STOCK_ITEM_MOVEMENT 
   drop constraint FK_STOCK_IT_STOCK_ITE_STOCK_IT;

alter table STOCK_ITEM_MOVEMENT 
   drop constraint FK_STOCK_IT_STOCK_ITE_ROOM;

alter table STOCK_ITEM_MOVEMENT 
   drop constraint FK_STOCK_IT_STOCK_ITE_ROOM;

alter table STOCK_ITEM_MOVEMENT 
   drop constraint FK_STOCK_IT_STOCK_ITE_MAINTENA;

alter table STOCK_ITEM_MOVEMENT 
   drop constraint FK_STOCK_IT_STOCK_ITE_EXTERNAL;

drop table if exists STOCK_ITEM_MOVEMENT;

drop table if exists STOCK_ITEM_TYPE;


alter table STOCK_ITEM_TYPE_ATTRIBUTE 
   drop constraint FK_STOCK_IT_STOCK_ITE_STOCK_IT;

alter table STOCK_ITEM_TYPE_ATTRIBUTE 
   drop constraint FK_STOCK_IT_STOCK_ITE_STOCK_IT;

drop table if exists STOCK_ITEM_TYPE_ATTRIBUTE;


/* Removed SUPERUSER_CREATES_ACCOUNT - fields now in USER_ACCOUNT */


/* Removed SUPERUSER_MODIFIES_ACCOUNT - fields now in USER_ACCOUNT */

drop table if exists SUPPLIER;


alter table USER_ACCOUNT 
   drop constraint FK_USER_ACC_PERSON_HA_PERSON;

drop table if exists USER_ACCOUNT;


alter table USER_SESSION 
   drop constraint FK_USER_SES_USER_HAS__USER_ACC;

drop table if exists USER_SESSION;

drop table if exists WAREHOUSE;

/*==============================================================*/
/* Table: ADMINISTRATIVE_CERTIFICATE                            */
/*==============================================================*/
create table ADMINISTRATIVE_CERTIFICATE
(
   ADMINISTRATIVE_CERTIFICATE_ID int not null,
   WAREHOUSE_ID         int not null,
   ATTRIBUTION_ORDER_ID int not null,
   RECEIPT_REPORT_ID    int not null,
   INTERESTED_ORGANIZATION varchar(60),
   OPERATION            varchar(20),
   FORMAT               varchar(8),
   IS_SIGNED_BY_WAREHOUSE_STORAGE_MAGAZINER boolean,
   IS_SIGNED_BY_WAREHOUSE_STORAGE_ACCOUNTANT boolean,
   IS_SIGNED_BY_WAREHOUSE_STORAGE_MARKETER boolean,
   IS_SIGNED_BY_WAREHOUSE_IT_CHIEF boolean,
   IS_SIGNED_BY_WAREHOUSE_LEADER boolean,
   DIGITAL_COPY         bytea,
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
   ASSET_ID             int not null,
   ASSET_MODEL_ID       int not null,
   ATTRIBUTION_ORDER_ID int not null,
   DESTRUCTION_CERTIFICATE_ID int not null,
   ASSET_SERIAL_NUMBER  varchar(48),
   ASSET_FABRICATION_DATETIME timestamp,
   ASSET_INVENTORY_NUMBER varchar(6),
   ASSET_SERVICE_TAG    varchar(24),
   ASSET_NAME           varchar(48),
   ASSET_NAME_IN_THE_ADMINISTRATIVE_CERTIFICATE varchar(48),
   ASSET_ARRIVAL_DATETIME timestamp,
   ASSET_STATUS         varchar(30),
   primary key (ASSET_ID)
);

/*==============================================================*/
/* Table: ASSET_ATTRIBUTE_DEFINITION                            */
/*==============================================================*/
create table ASSET_ATTRIBUTE_DEFINITION
(
   ASSET_ATTRIBUTE_DEFINITION_ID int not null,
   DATA_TYPE            varchar(18),
   UNIT                 varchar(24),
   DESCRIPTION          varchar(256),
   primary key (ASSET_ATTRIBUTE_DEFINITION_ID)
);

/*==============================================================*/
/* Table: ASSET_ATTRIBUTE_VALUE                                 */
/*==============================================================*/
create table ASSET_ATTRIBUTE_VALUE
(
   ASSET_ATTRIBUTE_DEFINITION_ID int not null,
   ASSET_ID             int not null,
   VALUE_STRING         varchar(1024),
   VALUE_BOOL           boolean,
   VALUE_DATE           date,
   VALUE_NUMBER         decimal(18,6),
   primary key (ASSET_ATTRIBUTE_DEFINITION_ID, ASSET_ID)
);

/*==============================================================*/
/* Table: ASSET_BRAND                                           */
/*==============================================================*/
create table ASSET_BRAND
(
   ASSET_BRAND_ID       int not null,
   BRAND_NAME           varchar(48),
   BRAND_CODE           varchar(16),
   IS_ACTIVE            boolean,
   primary key (ASSET_BRAND_ID)
);

/*==============================================================*/
/* Table: ASSET_CONDITION_HISTORY                               */
/*==============================================================*/
create table ASSET_CONDITION_HISTORY
(
   ASSET_CONDITION_HISTORY_ID int not null,
   ASSET_ID             int not null,
   CONDITION_ID         int not null,
   NOTES                varchar(256),
   COSMETIC_ISSUES      varchar(128),
   FUNCTIONAL_ISSUES    varchar(128),
   RECOMMENDATION       varchar(24),
   CREATED_AT           timestamp,
   primary key (ASSET_CONDITION_HISTORY_ID)
);

/*==============================================================*/
/* Table: ASSET_IS_ASSIGNED_TO_PERSON                           */
/*==============================================================*/
create table ASSET_IS_ASSIGNED_TO_PERSON
(
   PERSON_ID            int not null,
   ASSET_ID             int not null,
   ASSIGNED_BY_PERSON_ID int not null,
   ASSIGNMENT_ID        int not null,
   START_DATETIME       timestamp not null,
   END_DATETIME         timestamp not null,
   CONDITION_ON_ASSIGNMENT varchar(48) not null,
   IS_ACTIVE            boolean not null,
   primary key (ASSIGNMENT_ID)
);


/*==============================================================*/
/* Table: ASSET_IS_COMPOSED_OF_CONSUMABLE_HISTORY               */
/*==============================================================*/
create table ASSET_IS_COMPOSED_OF_CONSUMABLE_HISTORY
(
   CONSUMABLE_ID        int not null,
   ASSET_ID             int not null,
   MAINTENANCE_STEP_ID  int not null,
   START_DATETIME       timestamp,
   END_DATETIME         timestamp,
   primary key (CONSUMABLE_ID, ASSET_ID, MAINTENANCE_STEP_ID)
);

/*==============================================================*/
/* Table: ASSET_IS_COMPOSED_OF_STOCK_ITEMS_HISTORY              */
/*==============================================================*/
create table ASSET_IS_COMPOSED_OF_STOCK_ITEMS_HISTORY
(
   STOCK_ITEM_ID        int not null,
   ASSET_ID             int not null,
   MAINTENANCE_STEP_ID  int not null,
   START_DATETIME       timestamp,
   END_DATETIME         timestamp,
   primary key (STOCK_ITEM_ID, ASSET_ID, MAINTENANCE_STEP_ID)
);

/*==============================================================*/
/* Table: ASSET_MODEL                                           */
/*==============================================================*/
create table ASSET_MODEL
(
   ASSET_MODEL_ID       int not null,
   ASSET_BRAND_ID       int not null,
   ASSET_TYPE_ID        int not null,
   MODEL_NAME           varchar(48),
   MODEL_CODE           varchar(16),
   RELEASE_YEAR         int,
   DISCONTINUED_YEAR    int,
   IS_ACTIVE            boolean,
   NOTES                varchar(256),
   WARRANTY_EXPIRY_IN_MONTHS int,
   primary key (ASSET_MODEL_ID)
);

/*==============================================================*/
/* Table: ASSET_MODEL_ATTRIBUTE_VALUE                           */
/*==============================================================*/
create table ASSET_MODEL_ATTRIBUTE_VALUE
(
   ASSET_MODEL_ID       int not null,
   ASSET_ATTRIBUTE_DEFINITION_ID int not null,
   VALUE_BOOL           boolean,
   VALUE_STRING         varchar(1024),
   VALUE_NUMBER         decimal(18,6),
   VALUE_DATE           date,
   primary key (ASSET_MODEL_ID, ASSET_ATTRIBUTE_DEFINITION_ID)
);

/*==============================================================*/
/* Table: ASSET_MOVEMENT                                        */
/*==============================================================*/
create table ASSET_MOVEMENT
(
   ASSET_MOVEMENT_ID    int not null,
   ASSET_ID             int not null,
   SOURCE_ROOM_ID       int not null,
   DESTINATION_ROOM_ID  int not null,
   MAINTENANCE_STEP_ID  int,
   EXTERNAL_MAINTENANCE_STEP_ID int,
   MOVEMENT_REASON      varchar(128) not null,
   MOVEMENT_DATETIME    timestamp not null,
   primary key (ASSET_MOVEMENT_ID)
);

/*==============================================================*/
/* Table: ASSET_TYPE                                            */
/*==============================================================*/
create table ASSET_TYPE
(
   ASSET_TYPE_ID        int not null,
   ASSET_TYPE_LABEL     varchar(60),
   ASSET_TYPE_CODE      varchar(18),
   primary key (ASSET_TYPE_ID)
);

/*==============================================================*/
/* Table: ASSET_TYPE_ATTRIBUTE                                  */
/*==============================================================*/
create table ASSET_TYPE_ATTRIBUTE
(
   ASSET_ATTRIBUTE_DEFINITION_ID int not null,
   ASSET_TYPE_ID        int not null,
   IS_MANDATORY         boolean,
   DEFAULT_VALUE        varchar(255),
   primary key (ASSET_ATTRIBUTE_DEFINITION_ID, ASSET_TYPE_ID)
);

/*==============================================================*/
/* Table: ATTRIBUTION_ORDER                                     */
/*==============================================================*/
create table ATTRIBUTION_ORDER
(
   ATTRIBUTION_ORDER_ID int not null,
   WAREHOUSE_ID         int not null,
   ATTRIBUTION_ORDER_FULL_CODE varchar(48),
   ATTRIBUTION_ORDER_DATE date,
   IS_SIGNED_BY_CENTRAL_CHIEF boolean,
   ATTRIBUTION_ORDER_BARCODE varchar(24),
   primary key (ATTRIBUTION_ORDER_ID)
);

/*==============================================================*/
/* Table: AUTHENTICATION_LOG                                    */
/*==============================================================*/
create table AUTHENTICATION_LOG
(
   LOG_ID               int not null,
   USER_ID              int not null,
   ATTEMPTED_USERNAME   varchar(50),
   /* FIX: Merged multiple strings into one single comment string */
   EVENT_TYPE           varchar(24),
   IP_ADDRESS           varchar(45),
   EVENT_TIMESTAMP      timestamp,
   FAILURE_REASON       varchar(60),
   primary key (LOG_ID)
);

/*==============================================================*/
/* Table: BON_DE_COMMANDE                                       */
/*==============================================================*/
create table BON_DE_COMMANDE
(
   BON_DE_COMMANDE_ID   int not null,
   SUPPLIER_ID          int not null,
   DIGITAL_COPY         bytea,
   IS_SIGNED_BY_FINANCE boolean,
   BON_DE_COMMANDE_CODE varchar(10),
   primary key (BON_DE_COMMANDE_ID)
);

/*==============================================================*/
/* Table: BON_DE_LIVRAISON                                      */
/*==============================================================*/
create table BON_DE_LIVRAISON
(
   BON_DE_LIVRAISON_ID  int not null,
   BON_DE_COMMANDE_ID   int not null,
   BON_DE_LIVRAISON_DATE date,
   DIGITAL_COPY         bytea,
   BON_DE_LIVRAISON_CODE varchar(10),
   primary key (BON_DE_LIVRAISON_ID)
);

/*==============================================================*/
/* Table: BON_DE_RESTE                                          */
/*==============================================================*/
create table BON_DE_RESTE
(
   BON_DE_RESTE_ID      int not null,
   BON_DE_COMMANDE_ID   int not null,
   BON_DE_RESTE_DATE    date,
   DIGITAL_COPY         bytea,
   primary key (BON_DE_RESTE_ID)
);

/*==============================================================*/
/* Table: BROKEN_ITEM_REPORT                                    */
/*==============================================================*/
create table BROKEN_ITEM_REPORT
(
   BROKEN_ITEM_REPORT_ID int not null,
   DIGITAL_COPY         bytea,
   primary key (BROKEN_ITEM_REPORT_ID)
);


/*==============================================================*/
/* Table: COMPANY_ASSET_REQUEST                                 */
/*==============================================================*/
create table COMPANY_ASSET_REQUEST
(
   COMPANY_ASSET_REQUEST_ID int not null,
   ATTRIBUTION_ORDER_ID int not null,
   IS_SIGNED_BY_COMPANY boolean,
   ADMINISTRATIVE_SERIAL_NUMBER varchar(18),
   TITLE_OF_DEMAND      varchar(24),
   ORGANIZATION_BODY_DESIGNATION   varchar(60),
   REGISTER_NUMBER_OR_BOOK_JOURNAL_OF_CORPSE varchar(60),
   REGISTER_NUMBER_OR_BOOK_JOURNAL_OF_ESTABLISHMENT varchar(60),
   IS_SIGNED_BY_COMPANY_LEADER boolean,
   IS_SIGNED_BY_REGIONAL_PROVIDER boolean,
   IS_SIGNED_BY_COMPANY_REPRESENTATIVE boolean,
   DIGITAL_COPY         bytea,
   primary key (COMPANY_ASSET_REQUEST_ID)
);


/*==============================================================*/
/* Table: COMPANY_ASSET_REQUEST_IS_LINKED_TO_RECEIPT_REPORT     */
/*==============================================================*/
/* Removed COMPANY_ASSET_REQUEST_IS_LINKED_TO_RECEIPT_REPORT */

/*==============================================================*/
/* Table: CONSUMABLE                                            */
/*==============================================================*/
create table CONSUMABLE
(
   CONSUMABLE_ID        int not null,
   CONSUMABLE_MODEL_ID  int not null,
   DESTRUCTION_CERTIFICATE_ID int not null,
   CONSUMABLE_NAME      varchar(48),
   CONSUMABLE_SERIAL_NUMBER varchar(48),
   CONSUMABLE_FABRICATION_DATETIME timestamp,
   CONSUMABLE_INVENTORY_NUMBER varchar(6),
   CONSUMABLE_SERVICE_TAG varchar(48),
   CONSUMABLE_NAME_IN_ADMINISTRATIVE_CERTIFICATE varchar(48),
   CONSUMABLE_ARRIVAL_DATETIME timestamp,
   CONSUMABLE_STATUS    varchar(30),
   primary key (CONSUMABLE_ID)
);

/*==============================================================*/
/* Table: CONSUMABLE_ATTRIBUTE_DEFINITION                       */
/*==============================================================*/
create table CONSUMABLE_ATTRIBUTE_DEFINITION
(
   CONSUMABLE_ATTRIBUTE_DEFINITION_ID int not null,
   CONSUMABLE_TYPE_CODE varchar(18),
   DATA_TYPE            varchar(18),
   UNIT                 varchar(24),
   DESCRIPTION          varchar(256),
   primary key (CONSUMABLE_ATTRIBUTE_DEFINITION_ID)
);

/*==============================================================*/
/* Table: CONSUMABLE_ATTRIBUTE_VALUE                            */
/*==============================================================*/
create table CONSUMABLE_ATTRIBUTE_VALUE
(
   CONSUMABLE_ID        int not null,
   CONSUMABLE_ATTRIBUTE_DEFINITION_ID int not null,
   VALUE_STRING         varchar(1024),
   VALUE_BOOL           boolean,
   VALUE_DATE           date,
   VALUE_NUMBER         decimal(18,6),
   primary key (CONSUMABLE_ID, CONSUMABLE_ATTRIBUTE_DEFINITION_ID)
);

/*==============================================================*/
/* Table: CONSUMABLE_BRAND                                      */
/*==============================================================*/
create table CONSUMABLE_BRAND
(
   CONSUMABLE_BRAND_ID  int not null,
   BRAND_NAME           varchar(48),
   BRAND_CODE           varchar(16),
   IS_ACTIVE            boolean,
   primary key (CONSUMABLE_BRAND_ID)
);

/*==============================================================*/
/* Table: CONSUMABLE_CONDITION_HISTORY                          */
/*==============================================================*/
create table CONSUMABLE_CONDITION_HISTORY
(
   CONSUMABLE_CONDITION_HISTORY_ID int not null,
   CONSUMABLE_ID        int not null,
   NOTES                varchar(256),
   COSMETIC_ISSUES      varchar(128),
   FUNCTIONAL_ISSUES    varchar(128),
   RECOMMENDATION       varchar(24),
   CREATED_AT           timestamp,
   primary key (CONSUMABLE_CONDITION_HISTORY_ID)
);

/*==============================================================*/
/* Table: CONSUMABLE_CONDITION_HISTORY_HAS_PHYSICAL_CONDITION   */
/*==============================================================*/
create table CONSUMABLE_CONDITION_HISTORY_HAS_PHYSICAL_CONDITION
(
   CONSUMABLE_CONDITION_HISTORY_ID int not null,
   CONDITION_ID         int not null,
   primary key (CONSUMABLE_CONDITION_HISTORY_ID, CONDITION_ID)
);

/*==============================================================*/
/* Table: CONSUMABLE_IS_ASSIGNED_TO_PERSON                      */
/*==============================================================*/
create table CONSUMABLE_IS_ASSIGNED_TO_PERSON
(
   ASSIGNMENT_ID        int not null,
   CONSUMABLE_ID        int not null,
   PERSON_ID            int not null,
   ASSIGNED_BY_PERSON_ID int not null,
   START_DATETIME       timestamp not null,
   END_DATETIME         timestamp not null,
   CONDITION_ON_ASSIGNMENT varchar(48) not null,
   IS_ACTIVE            boolean not null,
   primary key (ASSIGNMENT_ID)
);


/*==============================================================*/
/* Table: CONSUMABLE_IS_USED_IN_STOCK_ITEM_HISTORY              */
/*==============================================================*/
create table CONSUMABLE_IS_USED_IN_STOCK_ITEM_HISTORY
(
   CONSUMABLE_ID        int not null,
   STOCK_ITEM_ID        int not null,
   MAINTENANCE_STEP_ID  int not null,
   START_DATETIME       timestamp,
   END_DATETIME         timestamp,
   primary key (CONSUMABLE_ID, STOCK_ITEM_ID, MAINTENANCE_STEP_ID)
);

/*==============================================================*/
/* Table: CONSUMABLE_MODEL                                      */
/*==============================================================*/
create table CONSUMABLE_MODEL
(
   CONSUMABLE_MODEL_ID  int not null,
   CONSUMABLE_TYPE_ID   int not null,
   CONSUMABLE_BRAND_ID  int not null,
   MODEL_NAME           varchar(48),
   MODEL_CODE           varchar(16),
   RELEASE_YEAR         int,
   DISCONTINUED_YEAR    int,
   IS_ACTIVE            boolean,
   NOTES                varchar(256),
   WARRANTY_EXPIRY_IN_MONTHS int,
   primary key (CONSUMABLE_MODEL_ID)
);

/*==============================================================*/
/* Table: CONSUMABLE_MODEL_ATTRIBUTE_VALUE                      */
/*==============================================================*/
create table CONSUMABLE_MODEL_ATTRIBUTE_VALUE
(
   CONSUMABLE_MODEL_ID  int not null,
   CONSUMABLE_ATTRIBUTE_DEFINITION_ID int not null,
   VALUE_BOOL           boolean,
   VALUE_STRING         varchar(1024),
   VALUE_NUMBER         decimal(18,6),
   VALUE_DATE           date,
   primary key (CONSUMABLE_MODEL_ID, CONSUMABLE_ATTRIBUTE_DEFINITION_ID)
);

/*==============================================================*/
/* Table: CONSUMABLE_MODEL_IS_FOUND_IN_BDC                      */
/*==============================================================*/
create table CONSUMABLE_MODEL_IS_FOUND_IN_BDC
(
   CONSUMABLE_MODEL_ID  int not null,
   BON_DE_COMMANDE_ID   int not null,
   QUANTITY_ORDERED     int,
   QUANTITY_RECEIVED    int,
   QUANTITY_INVOICED    int,
   UNIT_PRICE           decimal(10,2),
   primary key (CONSUMABLE_MODEL_ID, BON_DE_COMMANDE_ID)
);

/*==============================================================*/
/* Table: CONSUMABLE_MOVEMENT                                   */
/*==============================================================*/
create table CONSUMABLE_MOVEMENT
(
   CONSUMABLE_MOVEMENT_ID int not null,
   DESTINATION_ROOM_ID  int not null,
   SOURCE_ROOM_ID       int not null,
   MAINTENANCE_STEP_ID  int,
   EXTERNAL_MAINTENANCE_STEP_ID int,
   CONSUMABLE_ID        int not null,
   MOVEMENT_REASON      varchar(128) not null,
   MOVEMENT_DATETIME    timestamp not null,
   primary key (CONSUMABLE_MOVEMENT_ID)
);

/*==============================================================*/
/* Table: CONSUMABLE_TYPE                                       */
/*==============================================================*/
create table CONSUMABLE_TYPE
(
   CONSUMABLE_TYPE_ID   int not null,
   CONSUMABLE_TYPE_LABEL varchar(60),
   CONSUMABLE_TYPE_CODE varchar(18),
   primary key (CONSUMABLE_TYPE_ID)
);

/*==============================================================*/
/* Table: CONSUMABLE_TYPE_ATTRIBUTE                             */
/*==============================================================*/
create table CONSUMABLE_TYPE_ATTRIBUTE
(
   CONSUMABLE_TYPE_ID   int not null,
   CONSUMABLE_ATTRIBUTE_DEFINITION_ID int not null,
   IS_MANDATORY         boolean,
   DEFAULT_VALUE        varchar(255),
   primary key (CONSUMABLE_TYPE_ID, CONSUMABLE_ATTRIBUTE_DEFINITION_ID)
);

/*==============================================================*/
/* Table: C_IS_COMPATIBLE_WITH_A                                */
/*==============================================================*/
create table C_IS_COMPATIBLE_WITH_A
(
   CONSUMABLE_MODEL_ID  int not null,
   ASSET_MODEL_ID       int not null,
   primary key (CONSUMABLE_MODEL_ID, ASSET_MODEL_ID)
);

/*==============================================================*/
/* Table: C_IS_COMPATIBLE_WITH_SI                               */
/*==============================================================*/
create table C_IS_COMPATIBLE_WITH_SI
(
   CONSUMABLE_MODEL_ID  int not null,
   STOCK_ITEM_MODEL_ID  int not null,
   primary key (CONSUMABLE_MODEL_ID, STOCK_ITEM_MODEL_ID)
);

/*==============================================================*/
/* Table: DESTRUCTION_CERTIFICATE                               */
/*==============================================================*/
create table DESTRUCTION_CERTIFICATE
(
   DESTRUCTION_CERTIFICATE_ID int not null,
   DIGITAL_COPY         bytea,
   DESTRUCTION_DATETIME timestamp,
   primary key (DESTRUCTION_CERTIFICATE_ID)
);

/*==============================================================*/
/* Table: EXTERNAL_MAINTENANCE                                  */
/*==============================================================*/
create table EXTERNAL_MAINTENANCE
(
   EXTERNAL_MAINTENANCE_ID int not null,
   MAINTENANCE_ID       int not null,
   ITEM_RECEIVED_BY_MAINTENANCE_PROVIDER_DATETIME timestamp,
   ITEM_SENT_TO_COMPANY_DATETIME timestamp,
   ITEM_SENT_TO_EXTERNAL_MAINTENANCE_DATETIME timestamp,
   ITEM_RECEIVED_BY_COMPANY_DATETIME timestamp,
   primary key (EXTERNAL_MAINTENANCE_ID)
);

/*==============================================================*/
/* Table: EXTERNAL_MAINTENANCE_DOCUMENT                         */
/*==============================================================*/
create table EXTERNAL_MAINTENANCE_DOCUMENT
(
   EXTERNAL_MAINTENANCE_DOCUMENT_ID int not null,
   EXTERNAL_MAINTENANCE_ID int not null,
   DOCUMENT_IS_SIGNED   boolean,
   ITEM_IS_RECEIVED_BY_MAINTENANCE_PROVIDER boolean,
   MAINTENANCE_PROVIDER_FINAL_DECISION varchar(60),
   DIGITAL_COPY         bytea,
   primary key (EXTERNAL_MAINTENANCE_DOCUMENT_ID)
);

/*==============================================================*/
/* Table: EXTERNAL_MAINTENANCE_PROVIDER                         */
/*==============================================================*/
create table EXTERNAL_MAINTENANCE_PROVIDER
(
   EXTERNAL_MAINTENANCE_PROVIDER_ID int not null,
   EXTERNAL_MAINTENANCE_PROVIDER_NAME varchar(48),
   EXTERNAL_MAINTENANCE_PROVIDER_LOCATION varchar(128),
   primary key (EXTERNAL_MAINTENANCE_PROVIDER_ID)
);

/*==============================================================*/
/* Table: EXTERNAL_MAINTENANCE_STEP                             */
/*==============================================================*/
create table EXTERNAL_MAINTENANCE_STEP
(
   EXTERNAL_MAINTENANCE_STEP_ID int not null,
   EXTERNAL_MAINTENANCE_PROVIDER_ID int not null,
   EXTERNAL_MAINTENANCE_ID int not null,
   EXTERNAL_MAINTENANCE_TYPICAL_STEP_ID int not null,
   START_DATETIME       timestamp,
   END_DATETIME         timestamp,
   IS_SUCCESSFUL        boolean,
   primary key (EXTERNAL_MAINTENANCE_STEP_ID)
);

/*==============================================================*/
/* Table: EXTERNAL_MAINTENANCE_TYPICAL_STEP                     */
/*==============================================================*/
create table EXTERNAL_MAINTENANCE_TYPICAL_STEP
(
   EXTERNAL_MAINTENANCE_TYPICAL_STEP_ID int not null,
   ESTIMATED_COST       decimal(10,2),
   ACTUAL_COST          decimal(10,2),
   MAINTENANCE_TYPE     char(8),
   DESCRIPTION          varchar(256),
   primary key (EXTERNAL_MAINTENANCE_TYPICAL_STEP_ID)
);

/*==============================================================*/
/* Table: FACTURE                                               */
/*==============================================================*/
create table FACTURE
(
   FACTURE_ID           int not null,
   BON_DE_LIVRAISON_ID  int not null,
   DIGITAL_COPY         bytea,
   primary key (FACTURE_ID)
);

/*==============================================================*/
/* Table: MAINTENANCE                                           */
/*==============================================================*/
create table MAINTENANCE
(
   MAINTENANCE_ID       int not null,
   ASSET_ID             int not null,
   ASSIGNED_BY_PERSON_ID int not null,
   PERFORMED_BY_PERSON_ID int not null,
   APPROVED_BY_MAINTENANCE_CHIEF_ID int not null,
   IS_APPROVED_BY_MAINTENANCE_CHIEF boolean,
   START_DATETIME       timestamp not null,
   END_DATETIME         timestamp not null,
   DESCRIPTION          varchar(256),
   IS_SUCCESSFUL        boolean,
   DIGITAL_COPY         bytea,
   primary key (MAINTENANCE_ID)
);

/*==============================================================*/
/* Table: MAINTENANCE_INSPECTION_LEADS_TO_BROKEN_ITEM_REPORT    */
/*==============================================================*/
create table MAINTENANCE_INSPECTION_LEADS_TO_BROKEN_ITEM_REPORT
(
   MAINTENANCE_ID       int not null,
   BROKEN_ITEM_REPORT_ID int not null,
   primary key (MAINTENANCE_ID, BROKEN_ITEM_REPORT_ID)
);

/*==============================================================*/
/* Table: MAINTENANCE_STEP                                      */
/*==============================================================*/
create table MAINTENANCE_STEP
(
   MAINTENANCE_STEP_ID  int not null,
   MAINTENANCE_ID       int not null,
   MAINTENANCE_TYPICAL_STEP_ID int not null,
   PERSON_ID            int not null,
   ASSET_CONDITION_HISTORY_ID int,
   STOCK_ITEM_CONDITION_HISTORY_ID int,
   CONSUMABLE_CONDITION_HISTORY_ID int,
   START_DATETIME       timestamp,
   END_DATETIME         timestamp,
   IS_SUCCESSFUL        boolean,
   primary key (MAINTENANCE_STEP_ID)
);

/*==============================================================*/
/* Table: MAINTENANCE_TYPICAL_STEP                              */
/*==============================================================*/
create table MAINTENANCE_TYPICAL_STEP
(
   MAINTENANCE_TYPICAL_STEP_ID int not null,
   ESTIMATED_COST       decimal(10,2),
   ACTUAL_COST          decimal(10,2),
   DESCRIPTION          varchar(256),
   MAINTENANCE_TYPE     char(8),
   primary key (MAINTENANCE_TYPICAL_STEP_ID)
);

/*==============================================================*/
/* Table: ORGANIZATIONAL_STRUCTURE                              */
/*==============================================================*/
create table ORGANIZATIONAL_STRUCTURE
(
   ORGANIZATIONAL_STRUCTURE_ID int not null,
   STRUCTURE_CODE       varchar(50),
   STRUCTURE_NAME       varchar(255),
   STRUCTURE_TYPE       varchar(30),
   IS_ACTIVE            boolean,
   primary key (ORGANIZATIONAL_STRUCTURE_ID)
);

/*==============================================================*/
/* Table: ORGANIZATIONAL_STRUCTURE_RELATION                     */
/*==============================================================*/
create table ORGANIZATIONAL_STRUCTURE_RELATION
(
   ORGANIZATIONAL_STRUCTURE_ID int not null,
   PARENT_ORGANIZATIONAL_STRUCTURE_ID int not null,
   RELATION_ID          int,
   RELATION_TYPE        varchar(60),
   primary key (ORGANIZATIONAL_STRUCTURE_ID, PARENT_ORGANIZATIONAL_STRUCTURE_ID)
);

/*==============================================================*/
/* Table: PERSON                                                */
/*==============================================================*/
create table PERSON
(
   PERSON_ID            int not null,
   FIRST_NAME           varchar(48) not null,
   LAST_NAME            varchar(48) not null,
   SEX                  char(6) not null,
   BIRTH_DATE           date not null,
   IS_APPROVED          boolean not null,
   primary key (PERSON_ID)
);

/*==============================================================*/
/* Table: PERSON_ASSIGNMENT                                     */
/*==============================================================*/
create table PERSON_ASSIGNMENT
(
   ASSIGNMENT_ID        int not null,
   POSITION_ID          int not null,
   PERSON_ID            int not null,
   ASSIGNMENT_START_DATE date,
   ASSIGNMENT_END_DATE  date,
   EMPLOYMENT_TYPE      varchar(48),
   primary key (ASSIGNMENT_ID)
);

/*==============================================================*/
/* Table: PERSON_REPORTS_PROBLEM_ON_ASSET                       */
/*==============================================================*/
create table PERSON_REPORTS_PROBLEM_ON_ASSET
(
   ASSET_ID             int not null,
   PERSON_ID            int not null,
   REPORT_ID            int not null,
   REPORT_DATETIME      timestamp not null,
   OWNER_OBSERVATION    varchar(256) not null,
   primary key (REPORT_ID)
);

/*==============================================================*/
/* Table: PERSON_REPORTS_PROBLEM_ON_CONSUMABLE                  */
/*==============================================================*/
create table PERSON_REPORTS_PROBLEM_ON_CONSUMABLE
(
   PERSON_ID            int not null,
   CONSUMABLE_ID        int not null,
   REPORT_ID            int not null,
   REPORT_DATETIME      timestamp not null,
   OWNER_OBSERVATION    varchar(256) not null,
   primary key (REPORT_ID)
);

/*==============================================================*/
/* Table: PERSON_REPORTS_PROBLEM_ON_STOCK_ITEM                  */
/*==============================================================*/
create table PERSON_REPORTS_PROBLEM_ON_STOCK_ITEM
(
   PERSON_ID            int not null,
   STOCK_ITEM_ID        int not null,
   REPORT_ID            int not null,
   REPORT_DATETIME      timestamp not null,
   OWNER_OBSERVATION    varchar(256) not null,
   primary key (REPORT_ID)
);

/*==============================================================*/
/* Table: PHYSICAL_CONDITION                                    */
/*==============================================================*/
create table PHYSICAL_CONDITION
(
   CONDITION_ID         int not null,
   CONDITION_CODE       varchar(12),
   CONDITION_LABEL      varchar(12),
   DESCRIPTION          varchar(256),
   primary key (CONDITION_ID)
);

/*==============================================================*/
/* Table: POSITION                                              */
/*==============================================================*/
create table POSITION
(
   POSITION_ID          int not null,
   POSITION_CODE        varchar(48),
   POSITION_LABEL       varchar(60),
   DESCRIPTION          varchar(256),
   primary key (POSITION_ID)
);

/*==============================================================*/
/* Table: POSITION_ROLE_MAPPING                                 */
/*==============================================================*/
create table PERSON_ROLE_MAPPING
(
   ROLE_ID              int not null,
   PERSON_ID            int not null,
   primary key (ROLE_ID, PERSON_ID)
);

/*==============================================================*/
/* Table: RECEIPT_REPORT                                        */
/*==============================================================*/
create table RECEIPT_REPORT
(
   RECEIPT_REPORT_ID    int not null,
   REPORT_DATETIME      timestamp,
   REPORT_FULL_CODE     varchar(48),
   DIGITAL_COPY         bytea,
   primary key (RECEIPT_REPORT_ID)
);


/*==============================================================*/
/* Table: ROLE                                                  */
/*==============================================================*/
create table ROLE
(
   ROLE_ID              int not null,
   ROLE_CODE            varchar(24),
   ROLE_LABEL           varchar(24),
   DESCRIPTION          varchar(256),
   primary key (ROLE_ID)
);


/*==============================================================*/
/* Table: ROOM                                                  */
/*==============================================================*/
create table ROOM
(
   ROOM_ID              int not null,
   ROOM_NAME            varchar(30),
   ROOM_TYPE            varchar(24),
   primary key (ROOM_ID)
);

/*==============================================================*/
/* Table: ROOM_BELONGS_TO_ORGANIZATIONAL_STRUCTURE              */
/*==============================================================*/
create table ROOM_BELONGS_TO_ORGANIZATIONAL_STRUCTURE
(
   ORGANIZATIONAL_STRUCTURE_ID int not null,
   ROOM_ID              int not null,
   primary key (ORGANIZATIONAL_STRUCTURE_ID, ROOM_ID)
);

/*==============================================================*/
/* Table: STOCK_ITEM                                            */
/*==============================================================*/
create table STOCK_ITEM
(
   STOCK_ITEM_ID        int not null,
   MAINTENANCE_STEP_ID  int,
   STOCK_ITEM_MODEL_ID  int not null,
   DESTRUCTION_CERTIFICATE_ID int not null,
   STOCK_ITEM_FABRICATION_DATETIME timestamp,
   STOCK_ITEM_NAME      varchar(48),
   STOCK_ITEM_INVENTORY_NUMBER varchar(6),
   STOCK_ITEM_WARRANTY_EXPIRY_IN_MONTHS int,
   STOCK_ITEM_NAME_IN_ADMINISTRATIVE_CERTIFICATE varchar(48),
   STOCK_ITEM_ARRIVAL_DATETIME timestamp,
   STOCK_ITEM_STATUS    varchar(30),
   primary key (STOCK_ITEM_ID)
);

/*==============================================================*/
/* Table: STOCK_ITEM_ATTRIBUTE_DEFINITION                       */
/*==============================================================*/
create table STOCK_ITEM_ATTRIBUTE_DEFINITION
(
   STOCK_ITEM_ATTRIBUTE_DEFINITION_ID int not null,
   UNIT                 varchar(24),
   DESCRIPTION          varchar(256),
   DATA_TYPE            varchar(18),
   primary key (STOCK_ITEM_ATTRIBUTE_DEFINITION_ID)
);

/*==============================================================*/
/* Table: STOCK_ITEM_ATTRIBUTE_VALUE                            */
/*==============================================================*/
create table STOCK_ITEM_ATTRIBUTE_VALUE
(
   STOCK_ITEM_ATTRIBUTE_DEFINITION_ID int not null,
   STOCK_ITEM_ID        int not null,
   VALUE_STRING         varchar(1024),
   VALUE_BOOL           boolean,
   VALUE_DATE           date,
   VALUE_NUMBER         decimal(18,6),
   primary key (STOCK_ITEM_ATTRIBUTE_DEFINITION_ID, STOCK_ITEM_ID)
);

/*==============================================================*/
/* Table: STOCK_ITEM_BRAND                                      */
/*==============================================================*/
create table STOCK_ITEM_BRAND
(
   STOCK_ITEM_BRAND_ID  int not null,
   BRAND_NAME           varchar(48),
   BRAND_CODE           varchar(16),
   IS_ACTIVE            boolean,
   primary key (STOCK_ITEM_BRAND_ID)
);

/*==============================================================*/
/* Table: STOCK_ITEM_CONDITION_HISTORY                          */
/*==============================================================*/
create table STOCK_ITEM_CONDITION_HISTORY
(
   STOCK_ITEM_CONDITION_HISTORY_ID int not null,
   STOCK_ITEM_ID        int not null,
   CONDITION_ID         int not null,
   NOTES                varchar(256),
   COSMETIC_ISSUES      varchar(128),
   FUNCTIONAL_ISSUES    varchar(128),
   RECOMMENDATION       varchar(24),
   CREATED_AT           timestamp,
   primary key (STOCK_ITEM_CONDITION_HISTORY_ID)
);

/*==============================================================*/
/* Table: STOCK_ITEM_IS_ASSIGNED_TO_PERSON                      */
/*==============================================================*/
create table STOCK_ITEM_IS_ASSIGNED_TO_PERSON
(
   STOCK_ITEM_ID        int not null,
   PERSON_ID            int not null,
   ASSIGNED_BY_PERSON_ID int not null,
   ASSIGNMENT_ID        int not null,
   START_DATETIME       timestamp not null,
   END_DATETIME         timestamp not null,
   CONDITION_ON_ASSIGNMENT varchar(48) not null,
   IS_ACTIVE            boolean not null,
   primary key (ASSIGNMENT_ID)
);


/*==============================================================*/
/* Table: STOCK_ITEM_IS_COMPATIBLE_WITH_ASSET                   */
/*==============================================================*/
create table STOCK_ITEM_IS_COMPATIBLE_WITH_ASSET
(
   STOCK_ITEM_MODEL_ID  int not null,
   ASSET_MODEL_ID       int not null,
   primary key (STOCK_ITEM_MODEL_ID, ASSET_MODEL_ID)
);

/*==============================================================*/
/* Table: STOCK_ITEM_MODEL                                      */
/*==============================================================*/
create table STOCK_ITEM_MODEL
(
   STOCK_ITEM_MODEL_ID  int not null,
   STOCK_ITEM_TYPE_ID   int not null,
   STOCK_ITEM_BRAND_ID  int not null,
   MODEL_NAME           varchar(48),
   MODEL_CODE           varchar(16),
   RELEASE_YEAR         int,
   DISCONTINUED_YEAR    int,
   IS_ACTIVE            boolean,
   NOTES                varchar(256),
   WARRANTY_EXPIRY_IN_MONTHS int,
   primary key (STOCK_ITEM_MODEL_ID)
);

/*==============================================================*/
/* Table: STOCK_ITEM_MODEL_ATTRIBUTE_VALUE                      */
/*==============================================================*/
create table STOCK_ITEM_MODEL_ATTRIBUTE_VALUE
(
   STOCK_ITEM_ATTRIBUTE_DEFINITION_ID int not null,
   STOCK_ITEM_MODEL_ID  int not null,
   VALUE_BOOL           boolean,
   VALUE_STRING         varchar(1024),
   VALUE_DATE           date,
   VALUE_NUMBER         decimal(18,6),
   primary key (STOCK_ITEM_ATTRIBUTE_DEFINITION_ID, STOCK_ITEM_MODEL_ID)
);

/*==============================================================*/
/* Table: STOCK_ITEM_MODEL_IS_FOUND_IN_BDC                      */
/*==============================================================*/
create table STOCK_ITEM_MODEL_IS_FOUND_IN_BDC
(
   STOCK_ITEM_MODEL_ID  int not null,
   BON_DE_COMMANDE_ID   int not null,
   QUANTITY_ORDERED     int,
   QUANTITY_RECEIVED    int,
   QUANTITY_INVOICED    int,
   UNIT_PRICE           decimal(10,2),
   primary key (STOCK_ITEM_MODEL_ID, BON_DE_COMMANDE_ID)
);

/*==============================================================*/
/* Table: STOCK_ITEM_MOVEMENT                                   */
/*==============================================================*/
create table STOCK_ITEM_MOVEMENT
(
   STOCK_ITEM_MOVEMENT_ID int not null,
   STOCK_ITEM_ID        int not null,
   SOURCE_ROOM_ID       int not null,
   DESTINATION_ROOM_ID  int not null,
   MAINTENANCE_STEP_ID  int,
   EXTERNAL_MAINTENANCE_STEP_ID int,
   MOVEMENT_REASON      varchar(128) not null,
   MOVEMENT_DATETIME    timestamp not null,
   primary key (STOCK_ITEM_MOVEMENT_ID)
);

/*==============================================================*/
/* Table: STOCK_ITEM_TYPE                                       */
/*==============================================================*/
create table STOCK_ITEM_TYPE
(
   STOCK_ITEM_TYPE_ID   int not null,
   STOCK_ITEM_TYPE_LABEL varchar(60),
   STOCK_ITEM_TYPE_CODE varchar(18),
   primary key (STOCK_ITEM_TYPE_ID)
);

/*==============================================================*/
/* Table: STOCK_ITEM_TYPE_ATTRIBUTE                             */
/*==============================================================*/
create table STOCK_ITEM_TYPE_ATTRIBUTE
(
   STOCK_ITEM_ATTRIBUTE_DEFINITION_ID int not null,
   STOCK_ITEM_TYPE_ID   int not null,
   IS_MANDATORY         boolean,
   DEFAULT_VALUE        varchar(255),
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
   SUPPLIER_ID          int not null,
   SUPPLIER_NAME        varchar(60),
   SUPPLIER_ADDRESS     varchar(128),
   SUPPLIER_COMMERCIAL_REGISTER_NUMBER varchar(128),
   SUPPLIER_RIB         int,
   SUPPLIER_CPA         varchar(128),
   SUPPLIER_FISCAL_IDENTIFICATION_NUMBER int,
   SUPPLIER_FISCAL_STATIC_NUMBER int,
   primary key (SUPPLIER_ID)
);

/*==============================================================*/
/* Table: USER_ACCOUNT                                          */
/*==============================================================*/
create table USER_ACCOUNT
(
   USER_ID              int not null,
   PERSON_ID            int not null,
   USERNAME             varchar(20) not null,
   PASSWORD_HASH        varchar(512) not null,
   CREATED_AT_DATETIME  timestamp not null,
   DISABLED_AT_DATETIME timestamp not null,
   LAST_LOGIN           timestamp not null,
   ACCOUNT_STATUS       varchar(24) not null,
   FAILED_LOGIN_ATTEMPTS int not null,
   PASSWORD_LAST_CHANGED_DATETIME timestamp not null,
   CREATED_BY_USER_ID   int,
   MODIFIED_BY_USER_ID  int,
   MODIFIED_AT_DATETIME timestamp not null,
   primary key (USER_ID)
);

/*==============================================================*/
/* Table: USER_SESSION                                          */
/*==============================================================*/
create table USER_SESSION
(
   SESSION_ID           int not null,
   USER_ID              int not null,
   IP_ADDRESS           varchar(45) not null,
   USER_AGENT           varchar(60),
   LOGIN_DATETIME       timestamp not null,
   LAST_ACTIVITY        timestamp not null,
   LOGOUT_DATETIME      timestamp,
   primary key (SESSION_ID)
);

/*==============================================================*/
/* Table: WAREHOUSE                                             */
/*==============================================================*/
create table WAREHOUSE
(
   WAREHOUSE_ID         int not null,
   WAREHOUSE_NAME       varchar(60),
   WAREHOUSE_ADDRESS    varchar(128),
   primary key (WAREHOUSE_ID)
);


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



/* PostgreSQL Comments */
COMMENT ON COLUMN ADMINISTRATIVE_CERTIFICATE.ADMINISTRATIVE_CERTIFICATE_ID IS '';
COMMENT ON COLUMN ADMINISTRATIVE_CERTIFICATE.WAREHOUSE_ID IS '';
COMMENT ON COLUMN ADMINISTRATIVE_CERTIFICATE.ATTRIBUTION_ORDER_ID IS '';
COMMENT ON COLUMN ADMINISTRATIVE_CERTIFICATE.RECEIPT_REPORT_ID IS '';
COMMENT ON COLUMN ADMINISTRATIVE_CERTIFICATE.INTERESTED_ORGANIZATION IS '';
COMMENT ON COLUMN ADMINISTRATIVE_CERTIFICATE.OPERATION IS 'Action" can be "entry", "exit" or "transfer';
COMMENT ON COLUMN ADMINISTRATIVE_CERTIFICATE.FORMAT IS 'Among the formats is "21x27"';
COMMENT ON COLUMN ADMINISTRATIVE_CERTIFICATE.IS_SIGNED_BY_WAREHOUSE_STORAGE_MAGAZINER IS '';
COMMENT ON COLUMN ADMINISTRATIVE_CERTIFICATE.IS_SIGNED_BY_WAREHOUSE_STORAGE_ACCOUNTANT IS '';
COMMENT ON COLUMN ADMINISTRATIVE_CERTIFICATE.IS_SIGNED_BY_WAREHOUSE_STORAGE_MARKETER IS '';
COMMENT ON COLUMN ADMINISTRATIVE_CERTIFICATE.IS_SIGNED_BY_WAREHOUSE_IT_CHIEF IS '';
COMMENT ON COLUMN ADMINISTRATIVE_CERTIFICATE.IS_SIGNED_BY_WAREHOUSE_LEADER IS '';
COMMENT ON COLUMN ADMINISTRATIVE_CERTIFICATE.DIGITAL_COPY IS '';
COMMENT ON COLUMN ASSET.ASSET_ID IS '';
COMMENT ON COLUMN ASSET.ASSET_MODEL_ID IS '';
COMMENT ON COLUMN ASSET.ATTRIBUTION_ORDER_ID IS '';
COMMENT ON COLUMN ASSET.DESTRUCTION_CERTIFICATE_ID IS '';
COMMENT ON COLUMN ASSET.ASSET_SERIAL_NUMBER IS '';
COMMENT ON COLUMN ASSET.ASSET_FABRICATION_DATETIME IS '';
COMMENT ON COLUMN ASSET.ASSET_INVENTORY_NUMBER IS '';
COMMENT ON COLUMN ASSET.ASSET_SERVICE_TAG IS '';
COMMENT ON COLUMN ASSET.ASSET_NAME IS '';
COMMENT ON COLUMN ASSET.ASSET_NAME_IN_THE_ADMINISTRATIVE_CERTIFICATE IS '';
COMMENT ON COLUMN ASSET.ASSET_ARRIVAL_DATETIME IS '';
COMMENT ON COLUMN ASSET.ASSET_STATUS IS '';
COMMENT ON COLUMN ASSET_ATTRIBUTE_DEFINITION.ASSET_ATTRIBUTE_DEFINITION_ID IS '';
COMMENT ON COLUMN ASSET_ATTRIBUTE_DEFINITION.DATA_TYPE IS '';
COMMENT ON COLUMN ASSET_ATTRIBUTE_DEFINITION.UNIT IS '';
COMMENT ON COLUMN ASSET_ATTRIBUTE_DEFINITION.DESCRIPTION IS '';
COMMENT ON COLUMN ASSET_ATTRIBUTE_VALUE.ASSET_ATTRIBUTE_DEFINITION_ID IS '';
COMMENT ON COLUMN ASSET_ATTRIBUTE_VALUE.ASSET_ID IS '';
COMMENT ON COLUMN ASSET_ATTRIBUTE_VALUE.VALUE_STRING IS '';
COMMENT ON COLUMN ASSET_ATTRIBUTE_VALUE.VALUE_BOOL IS '';
COMMENT ON COLUMN ASSET_ATTRIBUTE_VALUE.VALUE_DATE IS '';
COMMENT ON COLUMN ASSET_ATTRIBUTE_VALUE.VALUE_NUMBER IS '';
COMMENT ON COLUMN ASSET_BRAND.ASSET_BRAND_ID IS '';
COMMENT ON COLUMN ASSET_BRAND.BRAND_NAME IS '';
COMMENT ON COLUMN ASSET_BRAND.BRAND_CODE IS '';
COMMENT ON COLUMN ASSET_BRAND.IS_ACTIVE IS '';
COMMENT ON COLUMN ASSET_CONDITION_HISTORY.ASSET_CONDITION_HISTORY_ID IS '';
COMMENT ON COLUMN ASSET_CONDITION_HISTORY.ASSET_ID IS '';
COMMENT ON COLUMN ASSET_CONDITION_HISTORY.CONDITION_ID IS '';
COMMENT ON COLUMN ASSET_CONDITION_HISTORY.NOTES IS '';
COMMENT ON COLUMN ASSET_CONDITION_HISTORY.COSMETIC_ISSUES IS '';
COMMENT ON COLUMN ASSET_CONDITION_HISTORY.FUNCTIONAL_ISSUES IS '';
COMMENT ON COLUMN ASSET_CONDITION_HISTORY.RECOMMENDATION IS '';
COMMENT ON COLUMN ASSET_CONDITION_HISTORY.CREATED_AT IS '';
COMMENT ON COLUMN ASSET_IS_ASSIGNED_TO_PERSON.PERSON_ID IS '';
COMMENT ON COLUMN ASSET_IS_ASSIGNED_TO_PERSON.ASSET_ID IS '';
COMMENT ON COLUMN ASSET_IS_ASSIGNED_TO_PERSON.ASSIGNED_BY_PERSON_ID IS '';
COMMENT ON COLUMN ASSET_IS_ASSIGNED_TO_PERSON.ASSIGNMENT_ID IS '';
COMMENT ON COLUMN ASSET_IS_ASSIGNED_TO_PERSON.START_DATETIME IS '';
COMMENT ON COLUMN ASSET_IS_ASSIGNED_TO_PERSON.END_DATETIME IS '';
COMMENT ON COLUMN ASSET_IS_ASSIGNED_TO_PERSON.CONDITION_ON_ASSIGNMENT IS '';
COMMENT ON COLUMN ASSET_IS_ASSIGNED_TO_PERSON.IS_ACTIVE IS '';
COMMENT ON TABLE ASSET_IS_ASSIGNED_TO_PERSON IS 'The first person is the one to whom the asset is assigned, a';
COMMENT ON COLUMN ASSET_IS_COMPOSED_OF_CONSUMABLE_HISTORY.CONSUMABLE_ID IS '';
COMMENT ON COLUMN ASSET_IS_COMPOSED_OF_CONSUMABLE_HISTORY.ASSET_ID IS '';
COMMENT ON COLUMN ASSET_IS_COMPOSED_OF_CONSUMABLE_HISTORY.MAINTENANCE_STEP_ID IS '';
COMMENT ON COLUMN ASSET_IS_COMPOSED_OF_CONSUMABLE_HISTORY.START_DATETIME IS '';
COMMENT ON COLUMN ASSET_IS_COMPOSED_OF_CONSUMABLE_HISTORY.END_DATETIME IS '';
COMMENT ON COLUMN ASSET_IS_COMPOSED_OF_STOCK_ITEMS_HISTORY.STOCK_ITEM_ID IS '';
COMMENT ON COLUMN ASSET_IS_COMPOSED_OF_STOCK_ITEMS_HISTORY.ASSET_ID IS '';
COMMENT ON COLUMN ASSET_IS_COMPOSED_OF_STOCK_ITEMS_HISTORY.MAINTENANCE_STEP_ID IS '';
COMMENT ON COLUMN ASSET_IS_COMPOSED_OF_STOCK_ITEMS_HISTORY.START_DATETIME IS '';
COMMENT ON COLUMN ASSET_IS_COMPOSED_OF_STOCK_ITEMS_HISTORY.END_DATETIME IS '';
COMMENT ON COLUMN ASSET_MODEL.ASSET_MODEL_ID IS '';
COMMENT ON COLUMN ASSET_MODEL.ASSET_BRAND_ID IS '';
COMMENT ON COLUMN ASSET_MODEL.ASSET_TYPE_ID IS '';
COMMENT ON COLUMN ASSET_MODEL.MODEL_NAME IS '';
COMMENT ON COLUMN ASSET_MODEL.MODEL_CODE IS '';
COMMENT ON COLUMN ASSET_MODEL.RELEASE_YEAR IS '';
COMMENT ON COLUMN ASSET_MODEL.DISCONTINUED_YEAR IS '';
COMMENT ON COLUMN ASSET_MODEL.IS_ACTIVE IS '';
COMMENT ON COLUMN ASSET_MODEL.NOTES IS '';
COMMENT ON COLUMN ASSET_MODEL.WARRANTY_EXPIRY_IN_MONTHS IS '';
COMMENT ON COLUMN ASSET_MODEL_ATTRIBUTE_VALUE.ASSET_MODEL_ID IS '';
COMMENT ON COLUMN ASSET_MODEL_ATTRIBUTE_VALUE.ASSET_ATTRIBUTE_DEFINITION_ID IS '';
COMMENT ON COLUMN ASSET_MODEL_ATTRIBUTE_VALUE.VALUE_BOOL IS '';
COMMENT ON COLUMN ASSET_MODEL_ATTRIBUTE_VALUE.VALUE_STRING IS '';
COMMENT ON COLUMN ASSET_MODEL_ATTRIBUTE_VALUE.VALUE_NUMBER IS '';
COMMENT ON COLUMN ASSET_MODEL_ATTRIBUTE_VALUE.VALUE_DATE IS '';
COMMENT ON COLUMN ASSET_MOVEMENT.ASSET_MOVEMENT_ID IS '';
COMMENT ON COLUMN ASSET_MOVEMENT.ASSET_ID IS '';
COMMENT ON COLUMN ASSET_MOVEMENT.SOURCE_ROOM_ID IS '';
COMMENT ON COLUMN ASSET_MOVEMENT.DESTINATION_ROOM_ID IS '';
COMMENT ON COLUMN ASSET_MOVEMENT.MAINTENANCE_STEP_ID IS '';
COMMENT ON COLUMN ASSET_MOVEMENT.EXTERNAL_MAINTENANCE_STEP_ID IS '';
COMMENT ON COLUMN ASSET_MOVEMENT.MOVEMENT_REASON IS '';
COMMENT ON COLUMN ASSET_MOVEMENT.MOVEMENT_DATETIME IS '';
COMMENT ON COLUMN ASSET_TYPE.ASSET_TYPE_ID IS '';
COMMENT ON COLUMN ASSET_TYPE.ASSET_TYPE_LABEL IS '';
COMMENT ON COLUMN ASSET_TYPE.ASSET_TYPE_CODE IS '';
COMMENT ON COLUMN ASSET_TYPE_ATTRIBUTE.ASSET_ATTRIBUTE_DEFINITION_ID IS '';
COMMENT ON COLUMN ASSET_TYPE_ATTRIBUTE.ASSET_TYPE_ID IS '';
COMMENT ON COLUMN ASSET_TYPE_ATTRIBUTE.IS_MANDATORY IS '';
COMMENT ON COLUMN ASSET_TYPE_ATTRIBUTE.DEFAULT_VALUE IS '';
COMMENT ON COLUMN ATTRIBUTION_ORDER.ATTRIBUTION_ORDER_ID IS '';
COMMENT ON COLUMN ATTRIBUTION_ORDER.WAREHOUSE_ID IS '';
COMMENT ON COLUMN ATTRIBUTION_ORDER.ATTRIBUTION_ORDER_FULL_CODE IS '';
COMMENT ON COLUMN ATTRIBUTION_ORDER.ATTRIBUTION_ORDER_DATE IS '';
COMMENT ON COLUMN ATTRIBUTION_ORDER.IS_SIGNED_BY_CENTRAL_CHIEF IS '';
COMMENT ON COLUMN ATTRIBUTION_ORDER.ATTRIBUTION_ORDER_BARCODE IS '';
COMMENT ON COLUMN AUTHENTICATION_LOG.LOG_ID IS '';
COMMENT ON COLUMN AUTHENTICATION_LOG.USER_ID IS '';
COMMENT ON COLUMN AUTHENTICATION_LOG.ATTEMPTED_USERNAME IS '';
COMMENT ON COLUMN AUTHENTICATION_LOG.EVENT_TYPE IS 'LOGIN_SUCCESS, LOGIN_FAILURE, LOGOUT, PWD_CHANGE, ACCOUNT_LOCK';
COMMENT ON COLUMN AUTHENTICATION_LOG.IP_ADDRESS IS '';
COMMENT ON COLUMN AUTHENTICATION_LOG.EVENT_TIMESTAMP IS '';
COMMENT ON COLUMN AUTHENTICATION_LOG.FAILURE_REASON IS 'e.g., Invalid Password, User Disabled';
COMMENT ON COLUMN BON_DE_COMMANDE.BON_DE_COMMANDE_ID IS '';
COMMENT ON COLUMN BON_DE_COMMANDE.SUPPLIER_ID IS '';
COMMENT ON COLUMN BON_DE_COMMANDE.DIGITAL_COPY IS '';
COMMENT ON COLUMN BON_DE_COMMANDE.IS_SIGNED_BY_FINANCE IS '';
COMMENT ON COLUMN BON_DE_COMMANDE.BON_DE_COMMANDE_CODE IS '';
COMMENT ON COLUMN BON_DE_LIVRAISON.BON_DE_LIVRAISON_ID IS '';
COMMENT ON COLUMN BON_DE_LIVRAISON.BON_DE_COMMANDE_ID IS '';
COMMENT ON COLUMN BON_DE_LIVRAISON.BON_DE_LIVRAISON_DATE IS '';
COMMENT ON COLUMN BON_DE_LIVRAISON.DIGITAL_COPY IS '';
COMMENT ON COLUMN BON_DE_LIVRAISON.BON_DE_LIVRAISON_CODE IS '';
COMMENT ON COLUMN BON_DE_RESTE.BON_DE_RESTE_ID IS '';
COMMENT ON COLUMN BON_DE_RESTE.BON_DE_COMMANDE_ID IS '';
COMMENT ON COLUMN BON_DE_RESTE.BON_DE_RESTE_DATE IS '';
COMMENT ON COLUMN BON_DE_RESTE.DIGITAL_COPY IS '';
COMMENT ON COLUMN BROKEN_ITEM_REPORT.BROKEN_ITEM_REPORT_ID IS '';
COMMENT ON COLUMN BROKEN_ITEM_REPORT.DIGITAL_COPY IS '';
COMMENT ON TABLE BROKEN_ITEM_REPORT IS 'Equivalent of C5';
COMMENT ON COLUMN COMPANY_ASSET_REQUEST.COMPANY_ASSET_REQUEST_ID IS '';
COMMENT ON COLUMN COMPANY_ASSET_REQUEST.ATTRIBUTION_ORDER_ID IS '';
COMMENT ON COLUMN COMPANY_ASSET_REQUEST.IS_SIGNED_BY_COMPANY IS '';
COMMENT ON COLUMN COMPANY_ASSET_REQUEST.ADMINISTRATIVE_SERIAL_NUMBER IS '';
COMMENT ON COLUMN COMPANY_ASSET_REQUEST.TITLE_OF_DEMAND IS '';
COMMENT ON COLUMN COMPANY_ASSET_REQUEST.ORGANIZATION_BODY_DESIGNATION IS '';
COMMENT ON COLUMN COMPANY_ASSET_REQUEST.REGISTER_NUMBER_OR_BOOK_JOURNAL_OF_CORPSE IS '';
COMMENT ON COLUMN COMPANY_ASSET_REQUEST.REGISTER_NUMBER_OR_BOOK_JOURNAL_OF_ESTABLISHMENT IS '';
COMMENT ON COLUMN COMPANY_ASSET_REQUEST.IS_SIGNED_BY_COMPANY_LEADER IS '';
COMMENT ON COLUMN COMPANY_ASSET_REQUEST.IS_SIGNED_BY_REGIONAL_PROVIDER IS '';
COMMENT ON COLUMN COMPANY_ASSET_REQUEST.IS_SIGNED_BY_COMPANY_REPRESENTATIVE IS '';
COMMENT ON COLUMN COMPANY_ASSET_REQUEST.DIGITAL_COPY IS '';
COMMENT ON TABLE COMPANY_ASSET_REQUEST IS 'Demande du mat�riel';
COMMENT ON COLUMN CONSUMABLE.CONSUMABLE_ID IS '';
COMMENT ON COLUMN CONSUMABLE.CONSUMABLE_MODEL_ID IS '';
COMMENT ON COLUMN CONSUMABLE.DESTRUCTION_CERTIFICATE_ID IS '';
COMMENT ON COLUMN CONSUMABLE.CONSUMABLE_NAME IS '';
COMMENT ON COLUMN CONSUMABLE.CONSUMABLE_SERIAL_NUMBER IS '';
COMMENT ON COLUMN CONSUMABLE.CONSUMABLE_FABRICATION_DATETIME IS '';
COMMENT ON COLUMN CONSUMABLE.CONSUMABLE_INVENTORY_NUMBER IS '';
COMMENT ON COLUMN CONSUMABLE.CONSUMABLE_SERVICE_TAG IS '';
COMMENT ON COLUMN CONSUMABLE.CONSUMABLE_NAME_IN_ADMINISTRATIVE_CERTIFICATE IS '';
COMMENT ON COLUMN CONSUMABLE.CONSUMABLE_ARRIVAL_DATETIME IS '';
COMMENT ON COLUMN CONSUMABLE.CONSUMABLE_STATUS IS '';
COMMENT ON COLUMN CONSUMABLE_ATTRIBUTE_DEFINITION.CONSUMABLE_ATTRIBUTE_DEFINITION_ID IS '';
COMMENT ON COLUMN CONSUMABLE_ATTRIBUTE_DEFINITION.CONSUMABLE_TYPE_CODE IS '';
COMMENT ON COLUMN CONSUMABLE_ATTRIBUTE_DEFINITION.DATA_TYPE IS '';
COMMENT ON COLUMN CONSUMABLE_ATTRIBUTE_DEFINITION.UNIT IS '';
COMMENT ON COLUMN CONSUMABLE_ATTRIBUTE_DEFINITION.DESCRIPTION IS '';
COMMENT ON COLUMN CONSUMABLE_ATTRIBUTE_VALUE.CONSUMABLE_ID IS '';
COMMENT ON COLUMN CONSUMABLE_ATTRIBUTE_VALUE.CONSUMABLE_ATTRIBUTE_DEFINITION_ID IS '';
COMMENT ON COLUMN CONSUMABLE_ATTRIBUTE_VALUE.VALUE_STRING IS '';
COMMENT ON COLUMN CONSUMABLE_ATTRIBUTE_VALUE.VALUE_BOOL IS '';
COMMENT ON COLUMN CONSUMABLE_ATTRIBUTE_VALUE.VALUE_DATE IS '';
COMMENT ON COLUMN CONSUMABLE_ATTRIBUTE_VALUE.VALUE_NUMBER IS '';
COMMENT ON COLUMN CONSUMABLE_BRAND.CONSUMABLE_BRAND_ID IS '';
COMMENT ON COLUMN CONSUMABLE_BRAND.BRAND_NAME IS '';
COMMENT ON COLUMN CONSUMABLE_BRAND.BRAND_CODE IS '';
COMMENT ON COLUMN CONSUMABLE_BRAND.IS_ACTIVE IS '';
COMMENT ON COLUMN CONSUMABLE_CONDITION_HISTORY.CONSUMABLE_CONDITION_HISTORY_ID IS '';
COMMENT ON COLUMN CONSUMABLE_CONDITION_HISTORY.CONSUMABLE_ID IS '';
COMMENT ON COLUMN CONSUMABLE_CONDITION_HISTORY.NOTES IS '';
COMMENT ON COLUMN CONSUMABLE_CONDITION_HISTORY.COSMETIC_ISSUES IS '';
COMMENT ON COLUMN CONSUMABLE_CONDITION_HISTORY.FUNCTIONAL_ISSUES IS '';
COMMENT ON COLUMN CONSUMABLE_CONDITION_HISTORY.RECOMMENDATION IS '';
COMMENT ON COLUMN CONSUMABLE_CONDITION_HISTORY.CREATED_AT IS '';
COMMENT ON COLUMN CONSUMABLE_CONDITION_HISTORY_HAS_PHYSICAL_CONDITION.CONSUMABLE_CONDITION_HISTORY_ID IS '';
COMMENT ON COLUMN CONSUMABLE_CONDITION_HISTORY_HAS_PHYSICAL_CONDITION.CONDITION_ID IS '';
COMMENT ON COLUMN CONSUMABLE_IS_ASSIGNED_TO_PERSON.ASSIGNMENT_ID IS '';
COMMENT ON COLUMN CONSUMABLE_IS_ASSIGNED_TO_PERSON.CONSUMABLE_ID IS '';
COMMENT ON COLUMN CONSUMABLE_IS_ASSIGNED_TO_PERSON.PERSON_ID IS '';
COMMENT ON COLUMN CONSUMABLE_IS_ASSIGNED_TO_PERSON.ASSIGNED_BY_PERSON_ID IS '';
COMMENT ON COLUMN CONSUMABLE_IS_ASSIGNED_TO_PERSON.START_DATETIME IS '';
COMMENT ON COLUMN CONSUMABLE_IS_ASSIGNED_TO_PERSON.END_DATETIME IS '';
COMMENT ON COLUMN CONSUMABLE_IS_ASSIGNED_TO_PERSON.CONDITION_ON_ASSIGNMENT IS '';
COMMENT ON COLUMN CONSUMABLE_IS_ASSIGNED_TO_PERSON.IS_ACTIVE IS '';
COMMENT ON TABLE CONSUMABLE_IS_ASSIGNED_TO_PERSON IS 'The first person is the one to whom the consumable is assign';
COMMENT ON COLUMN CONSUMABLE_IS_USED_IN_STOCK_ITEM_HISTORY.CONSUMABLE_ID IS '';
COMMENT ON COLUMN CONSUMABLE_IS_USED_IN_STOCK_ITEM_HISTORY.STOCK_ITEM_ID IS '';
COMMENT ON COLUMN CONSUMABLE_IS_USED_IN_STOCK_ITEM_HISTORY.MAINTENANCE_STEP_ID IS '';
COMMENT ON COLUMN CONSUMABLE_IS_USED_IN_STOCK_ITEM_HISTORY.START_DATETIME IS '';
COMMENT ON COLUMN CONSUMABLE_IS_USED_IN_STOCK_ITEM_HISTORY.END_DATETIME IS '';
COMMENT ON COLUMN CONSUMABLE_MODEL.CONSUMABLE_MODEL_ID IS '';
COMMENT ON COLUMN CONSUMABLE_MODEL.CONSUMABLE_TYPE_ID IS '';
COMMENT ON COLUMN CONSUMABLE_MODEL.CONSUMABLE_BRAND_ID IS '';
COMMENT ON COLUMN CONSUMABLE_MODEL.MODEL_NAME IS '';
COMMENT ON COLUMN CONSUMABLE_MODEL.MODEL_CODE IS '';
COMMENT ON COLUMN CONSUMABLE_MODEL.RELEASE_YEAR IS '';
COMMENT ON COLUMN CONSUMABLE_MODEL.DISCONTINUED_YEAR IS '';
COMMENT ON COLUMN CONSUMABLE_MODEL.IS_ACTIVE IS '';
COMMENT ON COLUMN CONSUMABLE_MODEL.NOTES IS '';
COMMENT ON COLUMN CONSUMABLE_MODEL.WARRANTY_EXPIRY_IN_MONTHS IS '';
COMMENT ON COLUMN CONSUMABLE_MODEL_ATTRIBUTE_VALUE.CONSUMABLE_MODEL_ID IS '';
COMMENT ON COLUMN CONSUMABLE_MODEL_ATTRIBUTE_VALUE.CONSUMABLE_ATTRIBUTE_DEFINITION_ID IS '';
COMMENT ON COLUMN CONSUMABLE_MODEL_ATTRIBUTE_VALUE.VALUE_BOOL IS '';
COMMENT ON COLUMN CONSUMABLE_MODEL_ATTRIBUTE_VALUE.VALUE_STRING IS '';
COMMENT ON COLUMN CONSUMABLE_MODEL_ATTRIBUTE_VALUE.VALUE_NUMBER IS '';
COMMENT ON COLUMN CONSUMABLE_MODEL_ATTRIBUTE_VALUE.VALUE_DATE IS '';
COMMENT ON COLUMN CONSUMABLE_MODEL_IS_FOUND_IN_BDC.CONSUMABLE_MODEL_ID IS '';
COMMENT ON COLUMN CONSUMABLE_MODEL_IS_FOUND_IN_BDC.BON_DE_COMMANDE_ID IS '';
COMMENT ON COLUMN CONSUMABLE_MODEL_IS_FOUND_IN_BDC.QUANTITY_ORDERED IS '';
COMMENT ON COLUMN CONSUMABLE_MODEL_IS_FOUND_IN_BDC.QUANTITY_RECEIVED IS '';
COMMENT ON COLUMN CONSUMABLE_MODEL_IS_FOUND_IN_BDC.QUANTITY_INVOICED IS '';
COMMENT ON COLUMN CONSUMABLE_MODEL_IS_FOUND_IN_BDC.UNIT_PRICE IS '';
COMMENT ON COLUMN CONSUMABLE_MOVEMENT.CONSUMABLE_MOVEMENT_ID IS '';
COMMENT ON COLUMN CONSUMABLE_MOVEMENT.DESTINATION_ROOM_ID IS '';
COMMENT ON COLUMN CONSUMABLE_MOVEMENT.SOURCE_ROOM_ID IS '';
COMMENT ON COLUMN CONSUMABLE_MOVEMENT.MAINTENANCE_STEP_ID IS '';
COMMENT ON COLUMN CONSUMABLE_MOVEMENT.EXTERNAL_MAINTENANCE_STEP_ID IS '';
COMMENT ON COLUMN CONSUMABLE_MOVEMENT.CONSUMABLE_ID IS '';
COMMENT ON COLUMN CONSUMABLE_MOVEMENT.MOVEMENT_REASON IS '';
COMMENT ON COLUMN CONSUMABLE_MOVEMENT.MOVEMENT_DATETIME IS '';
COMMENT ON COLUMN CONSUMABLE_TYPE.CONSUMABLE_TYPE_ID IS '';
COMMENT ON COLUMN CONSUMABLE_TYPE.CONSUMABLE_TYPE_LABEL IS '';
COMMENT ON COLUMN CONSUMABLE_TYPE.CONSUMABLE_TYPE_CODE IS '';
COMMENT ON COLUMN CONSUMABLE_TYPE_ATTRIBUTE.CONSUMABLE_TYPE_ID IS '';
COMMENT ON COLUMN CONSUMABLE_TYPE_ATTRIBUTE.CONSUMABLE_ATTRIBUTE_DEFINITION_ID IS '';
COMMENT ON COLUMN CONSUMABLE_TYPE_ATTRIBUTE.IS_MANDATORY IS '';
COMMENT ON COLUMN CONSUMABLE_TYPE_ATTRIBUTE.DEFAULT_VALUE IS '';
COMMENT ON COLUMN C_IS_COMPATIBLE_WITH_A.CONSUMABLE_MODEL_ID IS '';
COMMENT ON COLUMN C_IS_COMPATIBLE_WITH_A.ASSET_MODEL_ID IS '';
COMMENT ON COLUMN C_IS_COMPATIBLE_WITH_SI.CONSUMABLE_MODEL_ID IS '';
COMMENT ON COLUMN C_IS_COMPATIBLE_WITH_SI.STOCK_ITEM_MODEL_ID IS '';
COMMENT ON COLUMN DESTRUCTION_CERTIFICATE.DESTRUCTION_CERTIFICATE_ID IS '';
COMMENT ON COLUMN DESTRUCTION_CERTIFICATE.DIGITAL_COPY IS '';
COMMENT ON COLUMN DESTRUCTION_CERTIFICATE.DESTRUCTION_DATETIME IS '';
COMMENT ON COLUMN EXTERNAL_MAINTENANCE.EXTERNAL_MAINTENANCE_ID IS '';
COMMENT ON COLUMN EXTERNAL_MAINTENANCE.MAINTENANCE_ID IS '';
COMMENT ON COLUMN EXTERNAL_MAINTENANCE.ITEM_RECEIVED_BY_MAINTENANCE_PROVIDER_DATETIME IS '';
COMMENT ON COLUMN EXTERNAL_MAINTENANCE.ITEM_SENT_TO_COMPANY_DATETIME IS '';
COMMENT ON COLUMN EXTERNAL_MAINTENANCE.ITEM_SENT_TO_EXTERNAL_MAINTENANCE_DATETIME IS '';
COMMENT ON COLUMN EXTERNAL_MAINTENANCE.ITEM_RECEIVED_BY_COMPANY_DATETIME IS '';
COMMENT ON COLUMN EXTERNAL_MAINTENANCE_DOCUMENT.EXTERNAL_MAINTENANCE_DOCUMENT_ID IS '';
COMMENT ON COLUMN EXTERNAL_MAINTENANCE_DOCUMENT.EXTERNAL_MAINTENANCE_ID IS '';
COMMENT ON COLUMN EXTERNAL_MAINTENANCE_DOCUMENT.DOCUMENT_IS_SIGNED IS '';
COMMENT ON COLUMN EXTERNAL_MAINTENANCE_DOCUMENT.ITEM_IS_RECEIVED_BY_MAINTENANCE_PROVIDER IS '';
COMMENT ON COLUMN EXTERNAL_MAINTENANCE_DOCUMENT.MAINTENANCE_PROVIDER_FINAL_DECISION IS '';
COMMENT ON COLUMN EXTERNAL_MAINTENANCE_DOCUMENT.DIGITAL_COPY IS '';
COMMENT ON COLUMN EXTERNAL_MAINTENANCE_PROVIDER.EXTERNAL_MAINTENANCE_PROVIDER_ID IS '';
COMMENT ON COLUMN EXTERNAL_MAINTENANCE_PROVIDER.EXTERNAL_MAINTENANCE_PROVIDER_NAME IS '';
COMMENT ON COLUMN EXTERNAL_MAINTENANCE_PROVIDER.EXTERNAL_MAINTENANCE_PROVIDER_LOCATION IS '';
COMMENT ON COLUMN EXTERNAL_MAINTENANCE_STEP.EXTERNAL_MAINTENANCE_STEP_ID IS '';
COMMENT ON COLUMN EXTERNAL_MAINTENANCE_STEP.EXTERNAL_MAINTENANCE_PROVIDER_ID IS '';
COMMENT ON COLUMN EXTERNAL_MAINTENANCE_STEP.EXTERNAL_MAINTENANCE_ID IS '';
COMMENT ON COLUMN EXTERNAL_MAINTENANCE_STEP.EXTERNAL_MAINTENANCE_TYPICAL_STEP_ID IS '';
COMMENT ON COLUMN EXTERNAL_MAINTENANCE_STEP.START_DATETIME IS '';
COMMENT ON COLUMN EXTERNAL_MAINTENANCE_STEP.END_DATETIME IS '';
COMMENT ON COLUMN EXTERNAL_MAINTENANCE_STEP.IS_SUCCESSFUL IS '';
COMMENT ON COLUMN EXTERNAL_MAINTENANCE_TYPICAL_STEP.EXTERNAL_MAINTENANCE_TYPICAL_STEP_ID IS '';
COMMENT ON COLUMN EXTERNAL_MAINTENANCE_TYPICAL_STEP.ESTIMATED_COST IS '';
COMMENT ON COLUMN EXTERNAL_MAINTENANCE_TYPICAL_STEP.ACTUAL_COST IS '';
COMMENT ON COLUMN EXTERNAL_MAINTENANCE_TYPICAL_STEP.MAINTENANCE_TYPE IS 'Hardware or software';
COMMENT ON COLUMN EXTERNAL_MAINTENANCE_TYPICAL_STEP.DESCRIPTION IS '';
COMMENT ON COLUMN FACTURE.FACTURE_ID IS '';
COMMENT ON COLUMN FACTURE.BON_DE_LIVRAISON_ID IS '';
COMMENT ON COLUMN FACTURE.DIGITAL_COPY IS '';
COMMENT ON COLUMN MAINTENANCE.MAINTENANCE_ID IS '';
COMMENT ON COLUMN MAINTENANCE.ASSET_ID IS '';
COMMENT ON COLUMN MAINTENANCE.ASSIGNED_BY_PERSON_ID IS '';
COMMENT ON COLUMN MAINTENANCE.PERFORMED_BY_PERSON_ID IS '';
COMMENT ON COLUMN MAINTENANCE.APPROVED_BY_MAINTENANCE_CHIEF_ID IS '';
COMMENT ON COLUMN MAINTENANCE.IS_APPROVED_BY_MAINTENANCE_CHIEF IS '';
COMMENT ON COLUMN MAINTENANCE.START_DATETIME IS '';
COMMENT ON COLUMN MAINTENANCE.END_DATETIME IS '';
COMMENT ON COLUMN MAINTENANCE.DESCRIPTION IS '';
COMMENT ON COLUMN MAINTENANCE.IS_SUCCESSFUL IS '';
COMMENT ON COLUMN MAINTENANCE.DIGITAL_COPY IS '';
COMMENT ON COLUMN MAINTENANCE_INSPECTION_LEADS_TO_BROKEN_ITEM_REPORT.MAINTENANCE_ID IS '';
COMMENT ON COLUMN MAINTENANCE_INSPECTION_LEADS_TO_BROKEN_ITEM_REPORT.BROKEN_ITEM_REPORT_ID IS '';
COMMENT ON COLUMN MAINTENANCE_STEP.MAINTENANCE_STEP_ID IS '';
COMMENT ON COLUMN MAINTENANCE_STEP.MAINTENANCE_ID IS '';
COMMENT ON COLUMN MAINTENANCE_STEP.MAINTENANCE_TYPICAL_STEP_ID IS '';
COMMENT ON COLUMN MAINTENANCE_STEP.PERSON_ID IS '';
COMMENT ON COLUMN MAINTENANCE_STEP.ASSET_CONDITION_HISTORY_ID IS '';
COMMENT ON COLUMN MAINTENANCE_STEP.STOCK_ITEM_CONDITION_HISTORY_ID IS '';
COMMENT ON COLUMN MAINTENANCE_STEP.CONSUMABLE_CONDITION_HISTORY_ID IS '';
COMMENT ON COLUMN MAINTENANCE_STEP.START_DATETIME IS '';
COMMENT ON COLUMN MAINTENANCE_STEP.END_DATETIME IS '';
COMMENT ON COLUMN MAINTENANCE_STEP.IS_SUCCESSFUL IS '';
COMMENT ON COLUMN MAINTENANCE_TYPICAL_STEP.MAINTENANCE_TYPICAL_STEP_ID IS '';
COMMENT ON COLUMN MAINTENANCE_TYPICAL_STEP.ESTIMATED_COST IS '';
COMMENT ON COLUMN MAINTENANCE_TYPICAL_STEP.ACTUAL_COST IS '';
COMMENT ON COLUMN MAINTENANCE_TYPICAL_STEP.DESCRIPTION IS '';
COMMENT ON COLUMN MAINTENANCE_TYPICAL_STEP.MAINTENANCE_TYPE IS 'Hardware or software';
COMMENT ON COLUMN ORGANIZATIONAL_STRUCTURE.ORGANIZATIONAL_STRUCTURE_ID IS '';
COMMENT ON COLUMN ORGANIZATIONAL_STRUCTURE.STRUCTURE_CODE IS '';
COMMENT ON COLUMN ORGANIZATIONAL_STRUCTURE.STRUCTURE_NAME IS '';
COMMENT ON COLUMN ORGANIZATIONAL_STRUCTURE.STRUCTURE_TYPE IS '';
COMMENT ON COLUMN ORGANIZATIONAL_STRUCTURE.IS_ACTIVE IS '';
COMMENT ON COLUMN ORGANIZATIONAL_STRUCTURE_RELATION.ORGANIZATIONAL_STRUCTURE_ID IS '';
COMMENT ON COLUMN ORGANIZATIONAL_STRUCTURE_RELATION.PARENT_ORGANIZATIONAL_STRUCTURE_ID IS '';
COMMENT ON COLUMN ORGANIZATIONAL_STRUCTURE_RELATION.RELATION_ID IS '';
COMMENT ON COLUMN ORGANIZATIONAL_STRUCTURE_RELATION.RELATION_TYPE IS '';
COMMENT ON COLUMN PERSON.PERSON_ID IS '';
COMMENT ON COLUMN PERSON.FIRST_NAME IS '';
COMMENT ON COLUMN PERSON.LAST_NAME IS '';
COMMENT ON COLUMN PERSON.SEX IS '';
COMMENT ON COLUMN PERSON.BIRTH_DATE IS '';
COMMENT ON COLUMN PERSON.IS_APPROVED IS '';
COMMENT ON COLUMN PERSON_ASSIGNMENT.ASSIGNMENT_ID IS '';
COMMENT ON COLUMN PERSON_ASSIGNMENT.POSITION_ID IS '';
COMMENT ON COLUMN PERSON_ASSIGNMENT.PERSON_ID IS '';
COMMENT ON COLUMN PERSON_ASSIGNMENT.ASSIGNMENT_START_DATE IS '';
COMMENT ON COLUMN PERSON_ASSIGNMENT.ASSIGNMENT_END_DATE IS '';
COMMENT ON COLUMN PERSON_ASSIGNMENT.EMPLOYMENT_TYPE IS 'Permanent, contractual...';
COMMENT ON COLUMN PERSON_REPORTS_PROBLEM_ON_ASSET.ASSET_ID IS '';
COMMENT ON COLUMN PERSON_REPORTS_PROBLEM_ON_ASSET.PERSON_ID IS '';
COMMENT ON COLUMN PERSON_REPORTS_PROBLEM_ON_ASSET.REPORT_ID IS '';
COMMENT ON COLUMN PERSON_REPORTS_PROBLEM_ON_ASSET.REPORT_DATETIME IS '';
COMMENT ON COLUMN PERSON_REPORTS_PROBLEM_ON_ASSET.OWNER_OBSERVATION IS '';
COMMENT ON COLUMN PERSON_REPORTS_PROBLEM_ON_CONSUMABLE.PERSON_ID IS '';
COMMENT ON COLUMN PERSON_REPORTS_PROBLEM_ON_CONSUMABLE.CONSUMABLE_ID IS '';
COMMENT ON COLUMN PERSON_REPORTS_PROBLEM_ON_CONSUMABLE.REPORT_ID IS '';
COMMENT ON COLUMN PERSON_REPORTS_PROBLEM_ON_CONSUMABLE.REPORT_DATETIME IS '';
COMMENT ON COLUMN PERSON_REPORTS_PROBLEM_ON_CONSUMABLE.OWNER_OBSERVATION IS '';
COMMENT ON COLUMN PERSON_REPORTS_PROBLEM_ON_STOCK_ITEM.PERSON_ID IS '';
COMMENT ON COLUMN PERSON_REPORTS_PROBLEM_ON_STOCK_ITEM.STOCK_ITEM_ID IS '';
COMMENT ON COLUMN PERSON_REPORTS_PROBLEM_ON_STOCK_ITEM.REPORT_ID IS '';
COMMENT ON COLUMN PERSON_REPORTS_PROBLEM_ON_STOCK_ITEM.REPORT_DATETIME IS '';
COMMENT ON COLUMN PERSON_REPORTS_PROBLEM_ON_STOCK_ITEM.OWNER_OBSERVATION IS '';
COMMENT ON COLUMN PHYSICAL_CONDITION.CONDITION_ID IS '';
COMMENT ON COLUMN PHYSICAL_CONDITION.CONDITION_CODE IS '';
COMMENT ON COLUMN PHYSICAL_CONDITION.CONDITION_LABEL IS '';
COMMENT ON COLUMN PHYSICAL_CONDITION.DESCRIPTION IS '';
COMMENT ON COLUMN POSITION.POSITION_ID IS '';
COMMENT ON COLUMN POSITION.POSITION_CODE IS '';
COMMENT ON COLUMN POSITION.POSITION_LABEL IS '';
COMMENT ON COLUMN POSITION.DESCRIPTION IS '';
COMMENT ON COLUMN PERSON_ROLE_MAPPING.ROLE_ID IS 'Roles: TECHNICIAN, INVENTORY_MANAGER, ADMIN, VIEWER';
COMMENT ON COLUMN PERSON_ROLE_MAPPING.PERSON_ID IS '';
COMMENT ON COLUMN RECEIPT_REPORT.RECEIPT_REPORT_ID IS '';
COMMENT ON COLUMN RECEIPT_REPORT.REPORT_DATETIME IS '';
COMMENT ON COLUMN RECEIPT_REPORT.REPORT_FULL_CODE IS '';
COMMENT ON COLUMN RECEIPT_REPORT.DIGITAL_COPY IS '';
COMMENT ON TABLE RECEIPT_REPORT IS 'This represents the "PV de r�ception"';
COMMENT ON COLUMN ROLE.ROLE_ID IS 'Roles: TECHNICIAN, INVENTORY_MANAGER, ADMIN, VIEWER';
COMMENT ON COLUMN ROLE.ROLE_CODE IS '';
COMMENT ON COLUMN ROLE.ROLE_LABEL IS '';
COMMENT ON COLUMN ROLE.DESCRIPTION IS '';
COMMENT ON TABLE ROLE IS 'Role is what the person can do in the system';
COMMENT ON COLUMN ROOM.ROOM_ID IS '';
COMMENT ON COLUMN ROOM.ROOM_NAME IS '';
COMMENT ON COLUMN ROOM.ROOM_TYPE IS 'It  can be either "Storage Location" or "Work room" (bureau)';
COMMENT ON COLUMN ROOM_BELONGS_TO_ORGANIZATIONAL_STRUCTURE.ORGANIZATIONAL_STRUCTURE_ID IS '';
COMMENT ON COLUMN ROOM_BELONGS_TO_ORGANIZATIONAL_STRUCTURE.ROOM_ID IS '';
COMMENT ON COLUMN STOCK_ITEM.STOCK_ITEM_ID IS '';
COMMENT ON COLUMN STOCK_ITEM.MAINTENANCE_STEP_ID IS '';
COMMENT ON COLUMN STOCK_ITEM.STOCK_ITEM_MODEL_ID IS '';
COMMENT ON COLUMN STOCK_ITEM.DESTRUCTION_CERTIFICATE_ID IS '';
COMMENT ON COLUMN STOCK_ITEM.STOCK_ITEM_FABRICATION_DATETIME IS '';
COMMENT ON COLUMN STOCK_ITEM.STOCK_ITEM_NAME IS '';
COMMENT ON COLUMN STOCK_ITEM.STOCK_ITEM_INVENTORY_NUMBER IS '';
COMMENT ON COLUMN STOCK_ITEM.STOCK_ITEM_WARRANTY_EXPIRY_IN_MONTHS IS '';
COMMENT ON COLUMN STOCK_ITEM.STOCK_ITEM_NAME_IN_ADMINISTRATIVE_CERTIFICATE IS '';
COMMENT ON COLUMN STOCK_ITEM.STOCK_ITEM_ARRIVAL_DATETIME IS '';
COMMENT ON COLUMN STOCK_ITEM.STOCK_ITEM_STATUS IS '';
COMMENT ON COLUMN STOCK_ITEM_ATTRIBUTE_DEFINITION.STOCK_ITEM_ATTRIBUTE_DEFINITION_ID IS '';
COMMENT ON COLUMN STOCK_ITEM_ATTRIBUTE_DEFINITION.UNIT IS '';
COMMENT ON COLUMN STOCK_ITEM_ATTRIBUTE_DEFINITION.DESCRIPTION IS '';
COMMENT ON COLUMN STOCK_ITEM_ATTRIBUTE_DEFINITION.DATA_TYPE IS '';
COMMENT ON COLUMN STOCK_ITEM_ATTRIBUTE_VALUE.STOCK_ITEM_ATTRIBUTE_DEFINITION_ID IS '';
COMMENT ON COLUMN STOCK_ITEM_ATTRIBUTE_VALUE.STOCK_ITEM_ID IS '';
COMMENT ON COLUMN STOCK_ITEM_ATTRIBUTE_VALUE.VALUE_STRING IS '';
COMMENT ON COLUMN STOCK_ITEM_ATTRIBUTE_VALUE.VALUE_BOOL IS '';
COMMENT ON COLUMN STOCK_ITEM_ATTRIBUTE_VALUE.VALUE_DATE IS '';
COMMENT ON COLUMN STOCK_ITEM_ATTRIBUTE_VALUE.VALUE_NUMBER IS '';
COMMENT ON COLUMN STOCK_ITEM_BRAND.STOCK_ITEM_BRAND_ID IS '';
COMMENT ON COLUMN STOCK_ITEM_BRAND.BRAND_NAME IS '';
COMMENT ON COLUMN STOCK_ITEM_BRAND.BRAND_CODE IS '';
COMMENT ON COLUMN STOCK_ITEM_BRAND.IS_ACTIVE IS '';
COMMENT ON COLUMN STOCK_ITEM_CONDITION_HISTORY.STOCK_ITEM_CONDITION_HISTORY_ID IS '';
COMMENT ON COLUMN STOCK_ITEM_CONDITION_HISTORY.STOCK_ITEM_ID IS '';
COMMENT ON COLUMN STOCK_ITEM_CONDITION_HISTORY.CONDITION_ID IS '';
COMMENT ON COLUMN STOCK_ITEM_CONDITION_HISTORY.NOTES IS '';
COMMENT ON COLUMN STOCK_ITEM_CONDITION_HISTORY.COSMETIC_ISSUES IS '';
COMMENT ON COLUMN STOCK_ITEM_CONDITION_HISTORY.FUNCTIONAL_ISSUES IS '';
COMMENT ON COLUMN STOCK_ITEM_CONDITION_HISTORY.RECOMMENDATION IS '';
COMMENT ON COLUMN STOCK_ITEM_CONDITION_HISTORY.CREATED_AT IS '';
COMMENT ON COLUMN STOCK_ITEM_IS_ASSIGNED_TO_PERSON.STOCK_ITEM_ID IS '';
COMMENT ON COLUMN STOCK_ITEM_IS_ASSIGNED_TO_PERSON.PERSON_ID IS '';
COMMENT ON COLUMN STOCK_ITEM_IS_ASSIGNED_TO_PERSON.ASSIGNED_BY_PERSON_ID IS '';
COMMENT ON COLUMN STOCK_ITEM_IS_ASSIGNED_TO_PERSON.ASSIGNMENT_ID IS '';
COMMENT ON COLUMN STOCK_ITEM_IS_ASSIGNED_TO_PERSON.START_DATETIME IS '';
COMMENT ON COLUMN STOCK_ITEM_IS_ASSIGNED_TO_PERSON.END_DATETIME IS '';
COMMENT ON COLUMN STOCK_ITEM_IS_ASSIGNED_TO_PERSON.CONDITION_ON_ASSIGNMENT IS '';
COMMENT ON COLUMN STOCK_ITEM_IS_ASSIGNED_TO_PERSON.IS_ACTIVE IS '';
COMMENT ON TABLE STOCK_ITEM_IS_ASSIGNED_TO_PERSON IS 'The first person is the one to whom the stock item is assign';
COMMENT ON COLUMN STOCK_ITEM_IS_COMPATIBLE_WITH_ASSET.STOCK_ITEM_MODEL_ID IS '';
COMMENT ON COLUMN STOCK_ITEM_IS_COMPATIBLE_WITH_ASSET.ASSET_MODEL_ID IS '';
COMMENT ON COLUMN STOCK_ITEM_MODEL.STOCK_ITEM_MODEL_ID IS '';
COMMENT ON COLUMN STOCK_ITEM_MODEL.STOCK_ITEM_TYPE_ID IS '';
COMMENT ON COLUMN STOCK_ITEM_MODEL.STOCK_ITEM_BRAND_ID IS '';
COMMENT ON COLUMN STOCK_ITEM_MODEL.MODEL_NAME IS '';
COMMENT ON COLUMN STOCK_ITEM_MODEL.MODEL_CODE IS '';
COMMENT ON COLUMN STOCK_ITEM_MODEL.RELEASE_YEAR IS '';
COMMENT ON COLUMN STOCK_ITEM_MODEL.DISCONTINUED_YEAR IS '';
COMMENT ON COLUMN STOCK_ITEM_MODEL.IS_ACTIVE IS '';
COMMENT ON COLUMN STOCK_ITEM_MODEL.NOTES IS '';
COMMENT ON COLUMN STOCK_ITEM_MODEL.WARRANTY_EXPIRY_IN_MONTHS IS '';
COMMENT ON COLUMN STOCK_ITEM_MODEL_ATTRIBUTE_VALUE.STOCK_ITEM_ATTRIBUTE_DEFINITION_ID IS '';
COMMENT ON COLUMN STOCK_ITEM_MODEL_ATTRIBUTE_VALUE.STOCK_ITEM_MODEL_ID IS '';
COMMENT ON COLUMN STOCK_ITEM_MODEL_ATTRIBUTE_VALUE.VALUE_BOOL IS '';
COMMENT ON COLUMN STOCK_ITEM_MODEL_ATTRIBUTE_VALUE.VALUE_STRING IS '';
COMMENT ON COLUMN STOCK_ITEM_MODEL_ATTRIBUTE_VALUE.VALUE_DATE IS '';
COMMENT ON COLUMN STOCK_ITEM_MODEL_ATTRIBUTE_VALUE.VALUE_NUMBER IS '';
COMMENT ON COLUMN STOCK_ITEM_MODEL_IS_FOUND_IN_BDC.STOCK_ITEM_MODEL_ID IS '';
COMMENT ON COLUMN STOCK_ITEM_MODEL_IS_FOUND_IN_BDC.BON_DE_COMMANDE_ID IS '';
COMMENT ON COLUMN STOCK_ITEM_MODEL_IS_FOUND_IN_BDC.QUANTITY_ORDERED IS '';
COMMENT ON COLUMN STOCK_ITEM_MODEL_IS_FOUND_IN_BDC.QUANTITY_RECEIVED IS '';
COMMENT ON COLUMN STOCK_ITEM_MODEL_IS_FOUND_IN_BDC.QUANTITY_INVOICED IS '';
COMMENT ON COLUMN STOCK_ITEM_MODEL_IS_FOUND_IN_BDC.UNIT_PRICE IS '';
COMMENT ON COLUMN STOCK_ITEM_MOVEMENT.STOCK_ITEM_MOVEMENT_ID IS '';
COMMENT ON COLUMN STOCK_ITEM_MOVEMENT.STOCK_ITEM_ID IS '';
COMMENT ON COLUMN STOCK_ITEM_MOVEMENT.SOURCE_ROOM_ID IS '';
COMMENT ON COLUMN STOCK_ITEM_MOVEMENT.DESTINATION_ROOM_ID IS '';
COMMENT ON COLUMN STOCK_ITEM_MOVEMENT.MAINTENANCE_STEP_ID IS '';
COMMENT ON COLUMN STOCK_ITEM_MOVEMENT.EXTERNAL_MAINTENANCE_STEP_ID IS '';
COMMENT ON COLUMN STOCK_ITEM_MOVEMENT.MOVEMENT_REASON IS '';
COMMENT ON COLUMN STOCK_ITEM_MOVEMENT.MOVEMENT_DATETIME IS '';
COMMENT ON COLUMN STOCK_ITEM_TYPE.STOCK_ITEM_TYPE_ID IS '';
COMMENT ON COLUMN STOCK_ITEM_TYPE.STOCK_ITEM_TYPE_LABEL IS '';
COMMENT ON COLUMN STOCK_ITEM_TYPE.STOCK_ITEM_TYPE_CODE IS '';
COMMENT ON COLUMN STOCK_ITEM_TYPE_ATTRIBUTE.STOCK_ITEM_ATTRIBUTE_DEFINITION_ID IS '';
COMMENT ON COLUMN STOCK_ITEM_TYPE_ATTRIBUTE.STOCK_ITEM_TYPE_ID IS '';
COMMENT ON COLUMN STOCK_ITEM_TYPE_ATTRIBUTE.IS_MANDATORY IS '';
COMMENT ON COLUMN STOCK_ITEM_TYPE_ATTRIBUTE.DEFAULT_VALUE IS '';
COMMENT ON COLUMN SUPPLIER.SUPPLIER_ID IS '';
COMMENT ON COLUMN SUPPLIER.SUPPLIER_NAME IS '';
COMMENT ON COLUMN SUPPLIER.SUPPLIER_ADDRESS IS '';
COMMENT ON COLUMN SUPPLIER.SUPPLIER_COMMERCIAL_REGISTER_NUMBER IS '';
COMMENT ON COLUMN SUPPLIER.SUPPLIER_RIB IS '';
COMMENT ON COLUMN SUPPLIER.SUPPLIER_CPA IS '';
COMMENT ON COLUMN SUPPLIER.SUPPLIER_FISCAL_IDENTIFICATION_NUMBER IS '';
COMMENT ON COLUMN SUPPLIER.SUPPLIER_FISCAL_STATIC_NUMBER IS '';
COMMENT ON COLUMN USER_ACCOUNT.USER_ID IS '';
COMMENT ON COLUMN USER_ACCOUNT.PERSON_ID IS '';
COMMENT ON COLUMN USER_ACCOUNT.USERNAME IS '';
COMMENT ON COLUMN USER_ACCOUNT.PASSWORD_HASH IS '';
COMMENT ON COLUMN USER_ACCOUNT.CREATED_AT_DATETIME IS '';
COMMENT ON COLUMN USER_ACCOUNT.DISABLED_AT_DATETIME IS '';
COMMENT ON COLUMN USER_ACCOUNT.LAST_LOGIN IS '';
COMMENT ON COLUMN USER_ACCOUNT.ACCOUNT_STATUS IS '';
COMMENT ON COLUMN USER_ACCOUNT.FAILED_LOGIN_ATTEMPTS IS '';
COMMENT ON COLUMN USER_ACCOUNT.PASSWORD_LAST_CHANGED_DATETIME IS '';
COMMENT ON COLUMN USER_ACCOUNT.CREATED_BY_USER_ID IS '';
COMMENT ON COLUMN USER_ACCOUNT.MODIFIED_BY_USER_ID IS '';
COMMENT ON COLUMN USER_ACCOUNT.MODIFIED_AT_DATETIME IS '';
COMMENT ON COLUMN USER_SESSION.SESSION_ID IS '';
COMMENT ON COLUMN USER_SESSION.USER_ID IS '';
COMMENT ON COLUMN USER_SESSION.IP_ADDRESS IS '';
COMMENT ON COLUMN USER_SESSION.USER_AGENT IS '';
COMMENT ON COLUMN USER_SESSION.LOGIN_DATETIME IS '';
COMMENT ON COLUMN USER_SESSION.LAST_ACTIVITY IS '';
COMMENT ON COLUMN USER_SESSION.LOGOUT_DATETIME IS '';
COMMENT ON COLUMN WAREHOUSE.WAREHOUSE_ID IS '';
COMMENT ON COLUMN WAREHOUSE.WAREHOUSE_NAME IS '';
COMMENT ON COLUMN WAREHOUSE.WAREHOUSE_ADDRESS IS '';
COMMENT ON TABLE WAREHOUSE IS 'Warehouse" is in our case "ERI/2RM';
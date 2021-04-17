using {iot.planner as my} from '../db/schema';
using {AzureDevopsService as AzDevOps} from './azure-devops';
using {MSGraphService as MSGraph} from './msgraph-service';

service WorkItemsService @(requires : 'authenticated-user') {
    entity AzDevWorkItems as projection on AzDevOps.WorkItems;
    entity MSGraphEvents  as projection on MSGraph.Events;

    entity WorkItems      as
        select from my.WorkItems {
            *,
            current_date as currentDate : Date
        };

    entity MyWorkItems    as projection on WorkItems;

    entity IOTWorkItems   as
        select from WorkItems {
            activatedDate        as Datum        : String @(title : '{i18n>IOTWorkItems.Datum}'),
            completedDate        as DatumBis     : String @(title : '{i18n>IOTWorkItems.DatumBis}')  @UI.Hidden : true,
            ''                   as Beginn       : String @(title : '{i18n>IOTWorkItems.Von}'),
            ''                   as Ende         : String @(title : '{i18n>IOTWorkItems.Bis}'),
            ''                   as P1           : String @(title : '{i18n>IOTWorkItems.P1}'),
            project.IOTProjectID as Projekt      : String @(title : '{i18n>IOTWorkItems.Projekt}'),
            ''                   as Teilprojekt  : String @(title : '{i18n>IOTWorkItems.Teilprojekt}'),
            ''                   as Arbeitspaket : String @(title : '{i18n>IOTWorkItems.Arbeitspaket}'),
            'Durchführung'       as Taetigkeit   : String @(title : '{i18n>IOTWorkItems.Taetigkeit}'),
            'GE'                 as Einsatzort   : String @(title : '{i18n>IOTWorkItems.Einsatzort}'),
            ''                   as P2           : String @(title : '{i18n>IOTWorkItems.P2}'),
            title                as Bemerkung    : String @(title : '{i18n>IOTWorkItems.Bemerkung}')

        /*
        IOT Projektaufschreibung

        Datum |	Von | Bis | P1 | Projekt | Teilprojekt | Arbeitspaket | Tätigkeit | Einsatzort | P2 | Bemerkung
         */
        };

    entity Projects       as projection on my.Projects {
        * , workItems : redirected to AzDevWorkItems
    };

    entity Users          as projection on my.Users {
        * , workItems : redirected to AzDevWorkItems
    };

    entity Customers      as projection on my.Customers;
};
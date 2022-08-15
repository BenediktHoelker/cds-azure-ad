set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_categories(p_root character varying, p_date_from timestamp with time zone, p_date_until timestamp with time zone)
 RETURNS TABLE(id character varying, tenant character varying, parent_id character varying, title character varying, hierarchylevel character varying, totalduration numeric, datefrom timestamp with time zone, dateuntil timestamp with time zone)
 LANGUAGE plpgsql
AS $function$ 

#variable_conflict use_column

begin RETURN QUERY



WITH RECURSIVE cte AS (

    SELECT

        ID,
deepReference
        tenant,

        parent_ID,

        title,

        hierarchyLevel,

        description,

        reference,

        shallowReference as deepReference,

        title as path
deepReference
    FROMdeepReference

        iot_planner_Categories

    WHERE

        parent_ID = p_root

    UNION

    SELECT

        this.ID,

        this.tenant,

        this.parent_ID,

        this.title,

        this.hierarchyLevel,

        this.description,

        this.reference,

        CAST(

            (prior.deepReference || '-' || this.shallowReference) as varchar(5000)

        ) as deepReference,

        CAST(

            (prior.path || ' > ' || this.title) as varchar(5000)

        ) as path

    FROM

        cte AS prior

        INNER JOIN iot_planner_Categories AS this ON this.parent_ID = prior.ID

)

SELECT

    cte.*

FROM

    cte;



end $function$
;

CREATE OR REPLACE FUNCTION public.get_cumulative_category_durations(p_username character varying, p_date_from timestamp with time zone, p_date_until timestamp with time zone)
 RETURNS TABLE(id character varying, tenant character varying, parent_id character varying, title character varying, hierarchylevel character varying, totalduration numeric, accumulatedduration numeric)
 LANGUAGE plpgsql
AS $function$ #variable_conflict use_column

begin RETURN QUERY

/* for reference: https://stackoverflow.com/questions/26660189/recursive-query-with-sum-in-postgres */

WITH RECURSIVE cte AS (

    SELECT

        ID,

        ID as parent_ID,

        tenant,

        parent_ID as parent,

        title,

        hierarchyLevel,
deepReference
        totalDuration,

        totalDuration as accumulatedDuration

    FROM

        get_durations(p_username, p_date_from, p_date_until)

    UNION

	ALL

    SELECT

        c.ID,

        d.ID,

        c.tenant,

        c.parent,

        c.title,

        c.hierarchyLevel,

        c.totalDuration,

        d.totalDuration as accumulatedDuration

    FROM

        cte c

        JOIN get_durations(p_username, p_date_from, p_date_until) d on c.parent_ID = d.parent_ID

)

SELECT

    ID,

    tenant,

    parent as parent_ID,

    title,

    hierarchyLevel,

    totalDuration,

    sum(accumulatedDuration) AS accumulatedDuration

FROM

    cte 

GROUP BY

    ID,

    tenant,

    parent,

    hierarchyLevel,

    totalDuration,

    title;



end $function$
;

CREATE OR REPLACE FUNCTION public.get_cumulative_category_durations_with_path(p_username character varying, p_date_from timestamp with time zone, p_date_until timestamp with time zone)
 RETURNS TABLE(id character varying, tenant character varying, parent_id character varying, title character varying, hierarchylevel character varying, totalduration numeric, accumulatedduration numeric, deepreference character varying)
 LANGUAGE plpgsql
AS $function$ #variable_conflict use_column

begin RETURN QUERY

SELECT

    dur.ID,

    dur.tenant,

    dur.parent_ID,

    dur.title,

    dur.hierarchyLevel,

    dur.totalDuration,

    dur.accumulatedDuration,

    pathCTE.deepReference

FROM

    get_cumulative_category_durations(p_username, p_date_from, p_date_until) as dur

    JOIN iot_planner_categories_cte as pathCTE on pathCTE.ID = dur.ID;

end $function$
;

CREATE OR REPLACE FUNCTION public.get_durations(p_username character varying, p_date_from timestamp with time zone, p_date_until timestamp with time zone)
 RETURNS TABLE(id character varying, tenant character varying, parent_id character varying, title character varying, hierarchylevel character varying, totalduration numeric, datefrom timestamp with time zone, dateuntil timestamp with time zone)
 LANGUAGE plpgsql
AS $function$ 

#variable_conflict use_column

begin RETURN QUERY

SELECT

    cat.ID,

    cat.tenant,

    cat.parent_ID,

    cat.title,

    cat.hierarchyLevel,

    sum(wi.duration) as totalDuration,

    p_date_from as dateFrom,

    p_date_until as dateUntil

FROM

    iot_planner_categories as cat

    LEFT OUTER JOIN iot_planner_workitems as wi on wi.parent_ID = cat.ID

    and wi.assignedTo_userPrincipalName ilike p_username

    and wi.activateddate > p_date_from

    and wi.activateddate < p_date_until

GROUP BY

    cat.ID,

    cat.tenant,

    cat.parent_ID,

    cat.title,

    cat.hierarchyLevel;



end



$function$
;

create or replace view "public"."workitemsservice_iotworkitems" as  SELECT workitems_0.activateddate AS datum,
    workitems_0.completeddate AS datumbis,
    ''::text AS beginn,
    ''::text AS ende,
    ''::text AS p1,
    hierarchy_1.level1mappingid AS projekt,
    hierarchy_1.level2mappingid AS teilprojekt,
    hierarchy_1.level3mappingid AS arbeitspaket,
    'Durchf�hrung'::text AS taetigkeit,
    assignedto_2.userprincipalname AS nutzer,
    'GE'::text AS einsatzort,
    workitems_0.title AS bemerkung,
    workitems_0.tenant,
    assignedto_2.manager_userprincipalname AS manageruserprincipalname,
    workitems_0.id
   FROM ((iot_planner_workitems workitems_0
     LEFT JOIN iot_planner_hierarchies_hierarchies hierarchy_1 ON (((workitems_0.parent_id)::text = (hierarchy_1.id)::text)))
     LEFT JOIN iot_planner_users assignedto_2 ON (((workitems_0.assignedto_userprincipalname)::text = (assignedto_2.userprincipalname)::text)))
  WHERE (workitems_0.deleted IS NULL);




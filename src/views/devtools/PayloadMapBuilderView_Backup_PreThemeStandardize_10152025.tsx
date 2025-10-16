// PayloadMapBUilderView.tsx
//  Used to create payload JSON maps that are used by ef_step_assistant_PrepJSON
//  Once created these maps must be stored in wf_script_mapping_warehouse.script_mapping_json_payload

import { useEffect, useState, useRef } from "react";
import { useMemo } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { run_EF } from "@/lib/run_EF";
import { AutoResizeTextarea } from "@/components/ui/AutoResizeTextarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Pencil, Check, X, Trash2, SquareArrowUp, SquareArrowDown, Copy, FileCog, FileUp } from "lucide-react";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";




/********************************************************************************************************
 * GLOBAL VARIABLES
 *******************************************************************************************************/

// 1. Static list of configuration tables that store field maps
const configBaseTables = [
    { label: "Base Tables", tableName: "payload_base_tables" },
    { label: "Character Tables", tableName: "payload_character_tables" },
    { label: "Ability Tables", tableName: "payload_ability_tables" },
];

const LOCAL_STORAGE_KEY = "payloadMapBuilderState";

// ***** STYLE VARIALES *******
const Styled_CardHeader = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-lg text-center font-bold mb-2">{children}</label>
);



export default function PayloadMapBuilderView() {
    /***************************************************************************************************
     **************************************** Define useStates *****************************************
     ***************************************************************************************************/ 
     // Load/Save local storage form state
    const [get_LocalStorage_ViewSaveState, set_LocalStorage_ViewSaveState] = useState(false);
    // Base Table config selection
    const [get_BaseTableCard_SelectedConfigTable, set_BaseTableCard_SelectedConfigTable] = useState<string>("");
    const [get_BaseTableCard_ConfigTableData, set_BaseTableCard_ConfigTableData] = useState<any[]>([]);
    //SourceSelection states
    const [get_SourceSelections, set_SourceSelections] = useState<string[]>([]);
    // Base Table table selection and map generations
    const [get_BaseTableCard_SelectedTables, set_BaseTableCard_SelectedTables] = useState<string[]>([]);
    const [get_BaseTableCard_ConstructedBaseTableMap, set_BaseTableCard_ConstructedBaseTableMap] = useState({});
    // filterMap DSL definition layer
    const [get_FilterMapCard_OutputAlias, set_FilterMapCard_OutputAlias] = useState('');
    const [get_FilterMapCard_SelectedDataSource, set_FilterMapCard_SelectedDataSource] = useState('');
    const [get_FilterMapCard_MapPreview, set_FilterMapCard_MapPreview] = useState<any>({});
    const [get_FilterMapCard_FieldMap, set_FilterMapCard_FieldMap] = useState<Record<string, string[]>>({});
    const [get_FilterMapCard_ConstructedFilterMap, set_FilterMapCard_ConstructedFilterMap] = useState({});
    const [get_FilterMapCard_Mode, set_FilterMapCard_Mode] = useState<"add" | "edit" | "manage">("add");
    const [get_FilterMapCard_SelectedEditAlias, set_FilterMapCard_SelectedEditAlias] = useState('');
    const [get_FilterMapCard_FilterOrder, set_FilterMapCard_FilterOrder] = useState<string[]>([]);
    const [get_FilterMapCard_RenamingAlias, set_FilterMapCard_RenamingAlias] = useState<string | null>(null);
    const [get_FilterMapCard_RenameInput, set_FilterMapCard_RenameInput] = useState("");
    type FilterRule = {
      field: string;
      operator: string;
      matchTo: string;
      matchMode?: "value" | "reference"; // NEW
      refSource?: string;                // NEW
      refField?: string;                 // NEW
    };
    const [get_FilterMapCard_ConstructedFilters, set_FilterMapCard_ConstructedFilters] = useState<FilterRule[]>([{ field: "", operator: "=", matchTo: "", matchMode: "value" }]);

    // sectionMaps card
    //SectionMapCard variables
    const SectionMapCard_FIELD_TYPES = ["text", "jsonParsed", "nestedMapping"] as const;
    type SectionMapCard_FieldType = typeof SectionMapCard_FIELD_TYPES[number];
    type SectionFieldEntry = {
      alias: string;
      field: string;
      fieldType: SectionMapCard_FieldType;
    };
    type ModTag = { mod_tag: string; description?: string | null };
    const [get_SectionMapCard_BaseTablesOptions, set_SectionMapCard_BaseTablesOptions] = useState<string[]>([]);
    const [get_SectionMapCard_SelectedSource, set_SectionMapCard_SelectedSource] = useState("");
    const [get_SectionMapCard_FieldMap, set_SectionMapCard_FieldMap] = useState<Record<string, string[]>>({});
    const [get_SectionMapCard_SelectedFields, set_SectionMapCard_SelectedFields] = useState<SectionFieldEntry[]>([]);
    const [get_SectionMapCard_ConditionalSwitch, set_SectionMapCard_ConditionalSwitch] = useState<boolean>(false);
    const [get_SectionMapCard_ConstructedMap, set_SectionMapCard_ConstructedMap] = useState<Record<string, any>>({});
    const [get_SectionMapCard_SectionAilias, set_SectionMapCard_SectionAilias] = useState('');
    const [get_SectionMapCard_ConstructedJsonOutputMap, set_SectionMapCard_ConstructedJsonOutputMap] = useState<Record<string, any>>({});
    const [get_SectionMapCard_ConstructedSectionMap, set_SectionMapCard_ConstructedSectionMap] = useState({});
    const [get_SectionMapCard_Mode, set_SectionMapCard_Mode] = useState<"add" | "edit" | "manage">("add");
    const [get_SectionMapCard_SelectedEditAlias, set_SectionMapCard_SelectedEditAlias] = useState<string>("");
    const [get_SectionMapCard_SectionOrder, set_SectionMapCard_SectionOrder] = useState<string[]>([]);
    const [get_SectionMapCard_RenamingAlias, set_SectionMapCard_RenamingAlias] = useState<string | null>(null);
    const [get_SectionMapCard_RenameInput, set_SectionMapCard_RenameInput] = useState("");
    const [get_SectionMapCard_ModTags, set_SectionMapCard_ModTags] = useState<ModTag[]>([]);
    const sectionMapCard_ModTags_fetchedRef = useRef(false);
    const [get_SectionMapCard_ConditionValue, set_SectionMapCard_ConditionValue] = useState<string>("");

    // --- Nested Mapping Key Card (visual skeleton) ---
    type NestedAlias = { section: string; field: string }; // section alias + nested field alias
    const [get_NestedMapCard_AliasOptions, set_NestedMapCard_AliasOptions] = useState<NestedAlias[]>([]);
    const [get_NestedMapCard_SelectedAlias, set_NestedMapCard_SelectedAlias] = useState<NestedAlias | null>(null);
    const [get_NestedMapCard_RecordSource, set_NestedMapCard_RecordSource] = useState<string>("");
    const [get_NestedMapCard_LinkFieldInParent, set_NestedMapCard_LinkFieldInParent] = useState<string>("");
    const [get_NestedMapCard_ChildIDField, set_NestedMapCard_ChildIDField] = useState<string>("ID");
    const [get_NestedMapCard_FieldMappingKey, set_NestedMapCard_FieldMappingKey] = useState<string>("");
    const [get_NestedMapCard_SortKey, set_NestedMapCard_SortKey] = useState<string>("");
    const [get_NestedMapCard_ParentFields, set_NestedMapCard_ParentFields] = useState<string[]>([]);
    const [get_NestedMapCard_ChildFields, set_NestedMapCard_ChildFields] = useState<string[]>([]);
    const [get_NestedMapCard_ConstructedMap, set_NestedMapCard_ConstructedMap] = useState<Record<string, any>>({});
    const [get_NestedMapCard_Mode, set_NestedMapCard_Mode] = useState<"add" | "edit" | "manage">("add");
    const [get_NestedMapCard_SelectedEditAlias, set_NestedMapCard_SelectedEditAlias] = useState<string>("");


    const NESTED_MAP_SORT_KEY_OPTIONS = [
      "byArcID",
      "byBeatID",
      "byChapterNumber",
      "byCharacterName",
      "byCD_ID",
      "byItemName",
      "byAbilityID",
      "byMomentOrder",
      "byID",
      "bySceneNumber",
    ] as const;
    type NestedMapSortKey = typeof NESTED_MAP_SORT_KEY_OPTIONS[number];





    // ---------- Batching Map Card • STATE ----------

    /** Allowed modes for batching */
    type BatchingMode = "noBatching" | "outputControlled" | "dataDriven";

    /** Persisted shape (what Prep JSON EF expects) */
    type BatchingMapPersisted = {
      mode: BatchingMode;
      perBatchDefault?: number;
      perBatchKey?: string;
      source?: string;
      totalKey?: string;
    };

    /** Source option shape from get_SourceSelections */
    type SourceOption = { value: string; label: string };

    /** Props you likely already have around; if not, define them nearby */
    // const sourceSelections: SourceOption[] = useMemo(...)

    /** Output this for your preview composer */
    const [get_BatchingMapCard_ConstructedMap, set_BatchingMapCard_ConstructedMap] =
      useState<BatchingMapPersisted | undefined>(undefined);

    /** Local UI state */
    const [bm_mode, set_BM_Mode] = useState<BatchingMode>("noBatching");
    const [bm_perBatchDefault, set_BM_PerBatchDefault] = useState<number | "">("");
    const [bm_perBatchKey, set_BM_PerBatchKey] = useState<string>("");
    const [bm_source, set_BM_Source] = useState<string>("");
    const [bm_totalKey, set_BM_TotalKey] = useState<string>("");

    /** Alias helper (NOT persisted) */
    const [aliasInput, set_AliasInput] = useState<string>("");

    /** Guards so alias suggestions don't clobber manual edits */
    const [userTouchedTotalKey, set_UserTouchedTotalKey] = useState<boolean>(false);
    const [userTouchedPerBatchKey, set_UserTouchedPerBatchKey] = useState<boolean>(false);

    /** Inline errors */
    const [bm_errors, set_BM_Errors] = useState<string[]>([]);


    // Payload Preview Card
    const [get_PayloadPreviewCard_PreviewText, set_PayloadPreviewCard_PreviewText] = useState({});
    const [get_PayloadPreviewCard_NarrativeProjectID, set_PayloadPreviewCard_NarrativeProjectID] = useState("");



    // Field Map Preview
    type PreviewResultsType = {
        baseTableMap: object;
        jsonOutputMap: object;
        filterMap: object;
        sectionMaps: object;
        nestedMappingKey: object;
    };
    const [get_FieldMapPreview_Results, set_FieldMapPreview_Results] = useState<PreviewResultsType>({
        baseTableMap: {},
        jsonOutputMap: {},
        filterMap: {},
        sectionMaps: {},
        nestedMappingKey: {},
    });
    const [libraryCopied, setLibraryCopied] = useState(false);
    const [importOpen, setImportOpen] = useState(false);
    const [importText, setImportText] = useState("");
    const [importConfigKey, setImportConfigKey] = useState("");


    /****************************************************************************************************
     ************************************ Define derived values *****************************************
     *************************************calculated each render*****************************************/
    // Construct list of available sources from baseTables and filterMaps
    const baseAliases = useMemo(
      () => Object.keys(get_FieldMapPreview_Results?.baseTableMap ?? {}),
      [get_FieldMapPreview_Results?.baseTableMap]
    );

    // compiles a list of filterMap sources for drop downs
    const filterMapOptions = useMemo(() => {
      const order = get_FilterMapCard_FilterOrder?.length
        ? get_FilterMapCard_FilterOrder
        : Object.keys(get_FilterMapCard_ConstructedFilterMap ?? {});
      return order.map((alias) => ({
        alias,
        target:
          get_FilterMapCard_ConstructedFilterMap?.[alias]?.target ??
          `${alias}Records`,
      }));
    }, [get_FilterMapCard_FilterOrder, get_FilterMapCard_ConstructedFilterMap]);

    // OPTIONAL: if you still need a flat list of aliases somewhere:
    const allSourceAliases = useMemo(
      () => [...baseAliases, ...filterMapOptions.map(o => o.alias)],
      [baseAliases, filterMapOptions]
    );


    const previewAlias = useMemo(
      () => get_NestedMapCard_SelectedAlias?.field ?? "yourAliasHere",
      [get_NestedMapCard_SelectedAlias]
    );

    // Which section is the nested field on?
    const parentSourceAlias = useMemo(() => {
      const section = get_NestedMapCard_SelectedAlias?.section;
      return section
        ? (get_SectionMapCard_ConstructedJsonOutputMap?.[section]?.source ?? "")
        : "";
    }, [get_NestedMapCard_SelectedAlias, get_SectionMapCard_ConstructedJsonOutputMap]);


    const fieldMappingKeyOptions = useMemo<string[]>(
      () => Object.keys(get_SectionMapCard_ConstructedMap ?? {}).sort(),
      [get_SectionMapCard_ConstructedMap]
    );
    
    const childMapFieldsPreview = useMemo<string[]>(
      () => Object.keys((get_SectionMapCard_ConstructedMap?.[get_NestedMapCard_FieldMappingKey] ?? {})),
      [get_SectionMapCard_ConstructedMap, get_NestedMapCard_FieldMappingKey]
    );

    // The list of existing nestedMappingKey aliases (from your SoT)
    const nestedExistingAliases = useMemo(
      () => Object.keys(get_NestedMapCard_ConstructedMap ?? {}).sort(),
      [get_NestedMapCard_ConstructedMap]
    );
    /****************************************************************************************************
     **************************************** Define useEffects *****************************************
     ****************************************************************************************************/
    /*-----------------------------------------------
     ------- Save/Load Local Storage State -------
     -----------------------------------------------*/
     // #region
    // Save current state of form to browser local storage keeping the form data on hand during refresh
    useEffect(() => {
      if (!get_LocalStorage_ViewSaveState) return; // Skip saving until state is loaded, prevents overwriting on page load

      const saveableState = {
        get_BaseTableCard_SelectedConfigTable,
        get_BaseTableCard_SelectedTables,
        get_FilterMapCard_OutputAlias,
        get_FilterMapCard_SelectedDataSource,
        get_FilterMapCard_ConstructedFilters,
        get_FilterMapCard_ConstructedFilterMap,
        get_SectionMapCard_SelectedSource,
        get_SectionMapCard_FieldMap,
        get_SectionMapCard_SelectedFields,
        get_SectionMapCard_ConditionalSwitch,
        get_SectionMapCard_ConstructedMap,
        get_SectionMapCard_SectionAilias,
        get_SectionMapCard_ConstructedJsonOutputMap,
        get_PayloadPreviewCard_NarrativeProjectID,
        get_PayloadPreviewCard_PreviewText,
        get_NestedMapCard_ConstructedMap,
      };
    

      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(saveableState));
    }, [get_BaseTableCard_SelectedConfigTable, 
        get_BaseTableCard_SelectedTables, 
        get_FilterMapCard_OutputAlias, 
        get_FilterMapCard_SelectedDataSource, 
        get_FilterMapCard_ConstructedFilters,
        get_FilterMapCard_ConstructedFilterMap,
        get_SectionMapCard_SelectedSource,
        get_SectionMapCard_FieldMap,
        get_SectionMapCard_SelectedFields,
        get_SectionMapCard_ConditionalSwitch,
        get_SectionMapCard_ConstructedMap,
        get_SectionMapCard_SectionAilias,
        get_SectionMapCard_ConstructedJsonOutputMap,
        get_PayloadPreviewCard_NarrativeProjectID,
        get_PayloadPreviewCard_PreviewText,
      get_NestedMapCard_ConstructedMap, ]);

    // Load last form state from browser loacal storage on mount
    useEffect(() => {
    const restoreState = async () => {
      const savedState = localStorage.getItem(LOCAL_STORAGE_KEY);
      set_LocalStorage_ViewSaveState(true); // Still mark as loaded even if nothing found
      if (!savedState) return;

      // Get saved page state from local storage
      try {
        const {
          get_BaseTableCard_SelectedConfigTable,
          get_BaseTableCard_SelectedTables,
          get_FilterMapCard_OutputAlias,
          get_FilterMapCard_SelectedDataSource,
          get_FilterMapCard_ConstructedFilters,
          get_SectionMapCard_SelectedSource,
          get_SectionMapCard_FieldMap,
          get_SectionMapCard_SelectedFields,
          get_SectionMapCard_ConditionalSwitch,
          get_SectionMapCard_ConstructedMap,
          get_SectionMapCard_SectionAilias,
          get_FilterMapCard_ConstructedFilterMap,
          get_SectionMapCard_ConstructedJsonOutputMap,
          get_PayloadPreviewCard_NarrativeProjectID,
          get_PayloadPreviewCard_PreviewText,
          get_NestedMapCard_ConstructedMap,
        } = JSON.parse(savedState);

        //Repopulate all visual fields from useStores
        if (get_BaseTableCard_SelectedConfigTable) set_BaseTableCard_SelectedConfigTable(get_BaseTableCard_SelectedConfigTable);
        if (get_BaseTableCard_SelectedTables) set_BaseTableCard_SelectedTables(get_BaseTableCard_SelectedTables);
        if (get_FilterMapCard_OutputAlias) set_FilterMapCard_OutputAlias(get_FilterMapCard_OutputAlias);
        if (get_FilterMapCard_SelectedDataSource) set_FilterMapCard_SelectedDataSource(get_FilterMapCard_SelectedDataSource);
        if (get_FilterMapCard_ConstructedFilters) set_FilterMapCard_ConstructedFilters(get_FilterMapCard_ConstructedFilters);
        if (get_FilterMapCard_ConstructedFilterMap) set_FilterMapCard_ConstructedFilterMap(get_FilterMapCard_ConstructedFilterMap);
        if (get_SectionMapCard_SelectedSource) set_SectionMapCard_SelectedSource(get_SectionMapCard_SelectedSource);
        if (get_SectionMapCard_FieldMap) set_SectionMapCard_FieldMap(get_SectionMapCard_FieldMap);
        if (get_SectionMapCard_SelectedFields) set_SectionMapCard_SelectedFields(get_SectionMapCard_SelectedFields);
        if (get_SectionMapCard_ConditionalSwitch) set_SectionMapCard_ConditionalSwitch(get_SectionMapCard_ConditionalSwitch);
        if (get_SectionMapCard_ConstructedMap) set_SectionMapCard_ConstructedMap(get_SectionMapCard_ConstructedMap);
        if (get_SectionMapCard_SectionAilias) set_SectionMapCard_SectionAilias(get_SectionMapCard_SectionAilias);
        if (get_SectionMapCard_ConstructedJsonOutputMap) set_SectionMapCard_ConstructedJsonOutputMap(get_SectionMapCard_ConstructedJsonOutputMap);
        if (get_PayloadPreviewCard_NarrativeProjectID) set_PayloadPreviewCard_NarrativeProjectID(get_PayloadPreviewCard_NarrativeProjectID);
        if (get_PayloadPreviewCard_PreviewText) set_PayloadPreviewCard_PreviewText(get_PayloadPreviewCard_PreviewText);
        if (get_NestedMapCard_ConstructedMap) set_NestedMapCard_ConstructedMap(get_NestedMapCard_ConstructedMap);

      } catch (err) {
        console.warn("⚠️ Failed to parse saved payload builder state", err);
      }
    };
    restoreState();
    }, []);
    // #endregion

    /*-----------------------------------------------
     ------- Source Selection Options -------
     -----------------------------------------------*/    
     //#region
    useEffect(() => {
      // base aliases
      const baseAliases = Object.keys(get_BaseTableCard_ConstructedBaseTableMap ?? {});

      // filter map targets (ordered if you maintain order)
      const fmOrder = (get_FilterMapCard_FilterOrder?.length
        ? get_FilterMapCard_FilterOrder
        : Object.keys(get_FilterMapCard_ConstructedFilterMap ?? {}));

      const filterTargets = fmOrder.map((alias) => {
        const entry = get_FilterMapCard_ConstructedFilterMap?.[alias];
        return entry?.target ?? `${alias}Records`;
      });

      // merge, keep first occurrence (preserve order)
      const selections = [...baseAliases, ...filterTargets].filter(
        (v, i, arr) => arr.indexOf(v) === i
      );

      set_SourceSelections(selections);
    }, [
      get_BaseTableCard_ConstructedBaseTableMap,
      get_FilterMapCard_ConstructedFilterMap,
      get_FilterMapCard_FilterOrder, // optional but good for stable order
    ]);

     //#endregion


    /*-----------------------------------------------
     ----- Base Table Selection Card useEffects -----
     -----------------------------------------------*/
    // #region
    // onChange of Select Config Table dropdown
    useEffect(() =>{
      // get config data from db
      const getConfigData = async () => {
        let data;
        if(get_BaseTableCard_SelectedConfigTable !== ""){
           data = await selectAny(get_BaseTableCard_SelectedConfigTable);
           set_BaseTableCard_ConfigTableData( data );
        } else {
          console.error(`get_BaseTableCard_SelectedConfigTable is blank and selectAny was skipped`);
        }
      };
      getConfigData();
      //setForceRender(prev => !prev);
    }, [get_BaseTableCard_SelectedConfigTable]);

    // after get_BaseTableCard_ConfigTableData is ready
    useEffect(() => {
      if (!get_BaseTableCard_ConfigTableData) return;

      if (get_BaseTableCard_SelectedTables.length !== 0) {
        const fetchBaseMap = async () => {
          const builtMap = await buildBaseTablesMap(
            get_BaseTableCard_ConfigTableData,
            get_BaseTableCard_SelectedTables
          );
          set_BaseTableCard_ConstructedBaseTableMap(builtMap); // ✅ direct set
        };
        fetchBaseMap();
      } else {
        set_BaseTableCard_ConstructedBaseTableMap({}); // ✅ reset cleanly
      }
    }, [get_BaseTableCard_ConfigTableData, get_BaseTableCard_SelectedTables]);

    // #endregion
    /*-----------------------------------------------
     ------ Filtered Records Card useEffects -------
     -----------------------------------------------*/
    // #region
    // Ensure filterMap field dropdown updates if get_FilterMapCard_SelectedDataSource or get_FieldMapPreview_Results update
     useEffect(() => {
    if (!get_FilterMapCard_SelectedDataSource) return; // Skip if no source table is selected yet

      const fetchAndStoreFields = async () => {
          const tableName = resolveTableNameForSelection(
            get_FilterMapCard_SelectedDataSource,
            get_FieldMapPreview_Results?.baseTableMap ?? {},
            get_FilterMapCard_ConstructedFilterMap ?? {}
          );

          if (!tableName) return;


          const fields = await fetchTableFields(tableName, get_BaseTableCard_ConfigTableData, "table_name", "filterable_columns");

          // Store the fields in the field map state (keyed by get_FilterMapCard_SelectedDataSource)
          set_FilterMapCard_FieldMap((prev) => ({
          ...prev,
          [get_FilterMapCard_SelectedDataSource]: fields,
          }));
    
      };

      fetchAndStoreFields();
    }, [get_FilterMapCard_SelectedDataSource, get_FieldMapPreview_Results]); // <- this runs every time either value changes
    
    // Ensure field cache has entries for any refSource mentioned in the rules
    useEffect(() => {
      const rules = get_FilterMapCard_ConstructedFilters ?? [];

      // 1) unique, truthy refSource keys
      const uniqueSources = Array.from(
        new Set(
          rules
            .map(r => r?.refSource?.trim() || "")
            .filter(Boolean)
        )
      );

      // 2) only fetch for sources not already cached
      const missing = uniqueSources.filter(src => !(get_FilterMapCard_FieldMap && get_FilterMapCard_FieldMap[src]));
      if (missing.length === 0) return;

      let cancelled = false;

      (async () => {
        const batch: Record<string, string[]> = {};

        for (const src of missing) {
          const tableName = resolveTableNameForSelection(
            src,
            get_FieldMapPreview_Results?.baseTableMap ?? {},
            get_FilterMapCard_ConstructedFilterMap ?? {}
          );
          if (!tableName) continue;

          try {
            const fields = await fetchTableFields(
              tableName,
              get_BaseTableCard_ConfigTableData,
              "table_name",
              "filterable_columns"
            );
            if (!cancelled) batch[src] = fields;
          } catch (err) {
            console.warn("Ref fields fetch failed for", src, err);
          }
        }

        if (!cancelled && Object.keys(batch).length) {
          set_FilterMapCard_FieldMap(prev => ({ ...prev, ...batch }));
        }
      })();

      return () => { cancelled = true; };
    }, [get_FilterMapCard_ConstructedFilters]);


    useEffect(() => {
      if (get_FilterMapCard_Mode !== "edit") return;
      if (!get_FilterMapCard_SelectedEditAlias) return;

      const entry = get_FilterMapCard_ConstructedFilterMap[get_FilterMapCard_SelectedEditAlias];
      if (!entry) return;

      const draft = toDraftFromMapEntry(get_FilterMapCard_SelectedEditAlias, entry);

      set_FilterMapCard_OutputAlias(draft.alias);
      set_FilterMapCard_SelectedDataSource(draft.source); // triggers your existing fields fetch
      set_FilterMapCard_ConstructedFilters(
        draft.filters.length ? draft.filters : [{ field: "", operator: "=", matchTo: "" }]
      );

      // Do NOT touch preview here (commit-only behavior stays in Push handler)
    }, [
      get_FilterMapCard_Mode,
      get_FilterMapCard_SelectedEditAlias,
      get_FilterMapCard_ConstructedFilterMap,
    ]);


    //Clear the existing field elements in card
    useEffect(() => {
    if (get_FilterMapCard_Mode === "add") {
      // Clear any Edit selection and reset the draft to a blank Add form
      set_FilterMapCard_SelectedEditAlias("");
      resetAddDraft();
    } else if (get_FilterMapCard_Mode === "edit") {
      // Clear any Add alias in the input and wait for user to select an alias to load
      set_FilterMapCard_SelectedEditAlias("");
      // Intentionally DO NOT touch the current draft; user will pick an alias to preload
    }
  }, [get_FilterMapCard_Mode]);

    useEffect(() => {
      if (get_FilterMapCard_Mode !== "edit") return;
      if (!get_FilterMapCard_SelectedEditAlias) return;

      const entry =
        get_FilterMapCard_ConstructedFilterMap[get_FilterMapCard_SelectedEditAlias];
      if (!entry) return;

      const draft = toDraftFromMapEntry(get_FilterMapCard_SelectedEditAlias, entry);

      set_FilterMapCard_OutputAlias(draft.alias);
      set_FilterMapCard_SelectedDataSource(draft.source); // triggers your field-fetch effect
      set_FilterMapCard_ConstructedFilters(
        draft.filters.length ? draft.filters : [{ field: "", operator: "=", matchTo: "" }]
      );

    

    }, [
      get_FilterMapCard_Mode,
      get_FilterMapCard_SelectedEditAlias,
      get_FilterMapCard_ConstructedFilterMap,
    ]);


    // Keep order in sync with the constructed map:
    // - preserve existing relative order
    // - append any new aliases to the end
    // - drop any aliases that were removed
    useEffect(() => {
      const keys = Object.keys(get_FilterMapCard_ConstructedFilterMap || {});
      set_FilterMapCard_FilterOrder((prev) => {
        const preserved = prev.filter((a) => keys.includes(a));
        const additions = keys.filter((k) => !preserved.includes(k));
        return [...preserved, ...additions];
      });
    }, [get_FilterMapCard_ConstructedFilterMap]);

    // #endregion
    
    /*-----------------------------------------------
     ------- Section Map Card useEffects -------
     -----------------------------------------------*/
    // #region
     // When get_FieldMapPreview_Results base tableTableMap changes
      useEffect(() => {
        // TEMP MOCK DATA
        set_SectionMapCard_BaseTablesOptions(Object.keys(get_FieldMapPreview_Results.baseTableMap || {}));
      }, [get_FieldMapPreview_Results.baseTableMap]);

      // Ensure section map check box options update if get_SectionMapCard_SelectedSource
      useEffect(() => {
        if (!get_SectionMapCard_SelectedSource) return; // Skip if no source table is selected yet

        const fetchAndStoreFields = async () => {
            const tableName = resolveTableNameForSelection(
              get_SectionMapCard_SelectedSource,                  // alias OR target
              get_BaseTableCard_ConstructedBaseTableMap ?? {},       // base tables SoT
              get_FilterMapCard_ConstructedFilterMap ?? {}           // filter maps SoT
            );
            if (!tableName) return;


            const fields = await fetchTableFields(tableName, get_BaseTableCard_ConfigTableData, "table_name", "filterable_columns");

            // Store the fields in the field map state (keyed by get_SectionMapCard_SelectedSource)
            set_SectionMapCard_FieldMap((prev) => ({
            ...prev,
            [get_SectionMapCard_SelectedSource]: fields,
            }));
        };
      
      fetchAndStoreFields();
      }, [get_SectionMapCard_SelectedSource]); // <- this runs every time either value changes

      // When Constructed Map is saved after button click
      useEffect(() => {
        set_SectionMapCard_ConstructedSectionMap((prev) => ({
          ...prev,
          get_SectionMapCard_ConstructedMap,
        }));

      }, [get_SectionMapCard_ConstructedMap]);

      useEffect(() => {
        const src = get_SectionMapCard_SelectedSource;
        if (!src) return;

        const fields = get_SectionMapCard_FieldMap?.[src];
        if (!Array.isArray(fields) || fields.length === 0) return; // wait until fetched

        const allowed = new Set(fields);
        set_SectionMapCard_SelectedFields(prev => prev.filter(f => allowed.has(f.field)));
      }, [get_SectionMapCard_SelectedSource, get_SectionMapCard_FieldMap]);


      // Keep SectionOrder in sync with the constructed section map
      useEffect(() => {
        const keys = Object.keys(get_SectionMapCard_ConstructedMap || {});
        set_SectionMapCard_SectionOrder(prev => {
          // preserve current relative order for keys that still exist
          const preserved = prev.filter(k => keys.includes(k));
          // append any new keys that weren't already in order
          const additions = keys.filter(k => !preserved.includes(k));
          return [...preserved, ...additions];
        });
      }, [get_SectionMapCard_ConstructedMap]);


      // Load the mod_tags for use in ui
      useEffect(() => {
        if (sectionMapCard_ModTags_fetchedRef.current) {
          console.log(".current exit point");
          return;            // already fetched this mount
        }

        let aborted = false;
        (async () => {
          const { data, error } = await supabase
            .from("mod_tag_catalog")
            .select("mod_tag")
            .eq("active", true)
            .order("mod_tag");
          if (!aborted){
           set_SectionMapCard_ModTags((data ?? []) as ModTag[]);
           sectionMapCard_ModTags_fetchedRef.current = true;
          }
        })();


    
        return () => { aborted = true; };
      }, []); // single logical fetch even in Strict Mode

      useEffect(() => {
  console.log("get_SectionMapCard_ModTags:", get_SectionMapCard_ModTags);
}, [get_SectionMapCard_ModTags]);
      // #endregion


    /*-----------------------------------------------
     ------- Nested Map Card useEffects -------
     -----------------------------------------------*/
     //#region

     // when section map updates determine if any nestedMapping fields are included and setup for use in nested mapping card
      useEffect(() => {
        const maps = (get_SectionMapCard_ConstructedMap as Record<string, any>) ?? {};
        // Optional debug to confirm we're seeing sections/fields:
        // console.log("🔎 sectionMaps:", maps);

        const nextOptions: NestedAlias[] = [];

        // Gather all nestedMapping fields across all sections
        for (const [section, sectionMap] of Object.entries(maps)) {
          if (!sectionMap || typeof sectionMap !== "object") continue;

          for (const [aliasKey, cfg] of Object.entries(sectionMap as Record<string, any>)) {
            const fieldType = (cfg as any)?.fieldType ?? (cfg as any)?.type ?? "text";
            if (fieldType === "nestedMapping") {
              nextOptions.push({ section, field: aliasKey });
            }
          }
        }

        // Dedup (section::field)
        const seen = new Set<string>();
        const deduped = nextOptions.filter(o => {
          const k = `${o.section}::${o.field}`;
          if (seen.has(k)) return false;
          seen.add(k);
          return true;
        });

        set_NestedMapCard_AliasOptions(deduped);

        // Reconcile current selection
        if (get_NestedMapCard_SelectedAlias) {
          const exists = deduped.some(
            o =>
              o.section === get_NestedMapCard_SelectedAlias.section &&
              o.field === get_NestedMapCard_SelectedAlias.field
          );
          if (!exists) set_NestedMapCard_SelectedAlias(null);
        } else {
          // (Optional) auto-select first available:
          // if (deduped.length > 0) set_NestedMapCard_SelectedAlias(deduped[0]);
        }
      }, [get_SectionMapCard_ConstructedMap]); // <- watch the correct state



      useEffect(() => {
      let cancelled = false;
      (async () => {
        if (!parentSourceAlias?.trim()) {
          set_NestedMapCard_ParentFields([]);
          return;
        }
        // Reuse your existing helper; it resolves filter targets → base and caches
        const fields = await getFieldsForSource(parentSourceAlias);
        if (!cancelled) {
          set_NestedMapCard_ParentFields(fields ?? []);
          // If the current selection is no longer valid, clear it
          if (
            get_NestedMapCard_LinkFieldInParent &&
            fields &&
            !fields.includes(get_NestedMapCard_LinkFieldInParent)
          ) {
            set_NestedMapCard_LinkFieldInParent("");
          }
        }
      })();
      return () => { cancelled = true; };
    }, [
      parentSourceAlias,
      get_FilterMapCard_ConstructedFilterMap, // if filter chains change, fields may change
      get_FieldMapPreview_Results?.baseTableMap // base tables changing also affects fields
    ]);


    useEffect(() => {
    let cancelled = false;

    (async () => {
      const src = (get_NestedMapCard_RecordSource || "").trim();

      // no source selected → clear list, keep default "ID" as placeholder
      if (!src) {
        set_NestedMapCard_ChildFields([]);
        return;
      }

      const fields = await getFieldsForSource(src); // reuses your resolver+cache
      if (cancelled) return;

      const list = fields ?? [];
      set_NestedMapCard_ChildFields(list);

      // If the current selection is no longer valid, clear it
      if (
        get_NestedMapCard_ChildIDField &&
        list.length &&
        !list.includes(get_NestedMapCard_ChildIDField)
      ) {
        set_NestedMapCard_ChildIDField("");
      }

      // Optional: auto-pick a sensible default the first time
      if (!get_NestedMapCard_ChildIDField && list.length) {
        const preferred = ["id", "ID", "uuid", "UUID"];
        const auto = preferred.find(p => list.includes(p)) || "";
        if (auto) set_NestedMapCard_ChildIDField(auto);
      }
    })();

    return () => { cancelled = true; };
    }, [
      get_NestedMapCard_RecordSource,
      get_FilterMapCard_ConstructedFilterMap,           // if filter chain changes, fields can change
      get_FieldMapPreview_Results?.baseTableMap         // base table changes also affect fields
    ]);

      useEffect(() => {
      if (
        get_NestedMapCard_FieldMappingKey &&
        !fieldMappingKeyOptions.includes(get_NestedMapCard_FieldMappingKey)
      ) {
        set_NestedMapCard_FieldMappingKey("");
      }
    }, [fieldMappingKeyOptions, get_NestedMapCard_FieldMappingKey]);


    useEffect(() => {
      if (
        get_NestedMapCard_SortKey &&
        !NESTED_MAP_SORT_KEY_OPTIONS.includes(get_NestedMapCard_SortKey as NestedMapSortKey)
      ) {
        set_NestedMapCard_SortKey(""); // clear if it somehow became invalid
      }
    }, [get_NestedMapCard_SortKey]);


    // Hydrate inputs when switching which alias to edit
    useEffect(() => {
      const alias = get_NestedMapCard_SelectedEditAlias?.trim();
      if (!alias) return;

      const cfg = get_NestedMapCard_ConstructedMap?.[alias];
      set_NestedMapCard_RecordSource(cfg?.recordSource ?? "");
      set_NestedMapCard_LinkFieldInParent(cfg?.linkFieldInParent ?? "");
      set_NestedMapCard_ChildIDField(cfg?.childIDField ?? "ID");
      set_NestedMapCard_FieldMappingKey(cfg?.fieldMappingKey ?? "");
      set_NestedMapCard_SortKey(cfg?.sortKey ?? "");
    }, [get_NestedMapCard_SelectedEditAlias, get_NestedMapCard_ConstructedMap]);
    
     //#endregion


    /*-----------------------------------------------
     ------- Batching Map Card useEffects -------
     -----------------------------------------------*/
      //#region
      // ---------- Batching Map Card • EFFECTS ----------

      /**
       * 1) Hydrate local UI state from an existing constructed map (edit mode).
       *    Only sets local inputs; does NOT write back to constructed map.
       */
      useEffect(() => {
        const existing = get_BatchingMapCard_ConstructedMap;
        if (!existing) return;

        set_BM_Mode(existing.mode ?? "noBatching");
        set_BM_PerBatchDefault(existing.perBatchDefault ?? "");
        set_BM_PerBatchKey(existing.perBatchKey ?? "");
        set_BM_Source(existing.source ?? "");
        set_BM_TotalKey(existing.totalKey ?? "");

        // prevent alias auto-suggest from overwriting existing keys
        set_UserTouchedTotalKey(!!existing.totalKey);
        set_UserTouchedPerBatchKey(!!existing.perBatchKey);
      }, [get_BatchingMapCard_ConstructedMap]);

      /**
       * 2) When mode changes, clear irrelevant inputs and errors.
       *    Keeps the UI clean and ensures only valid keys will be emitted.
       */
      useEffect(() => {
        if (bm_mode === "noBatching") {
          set_BM_PerBatchDefault("");
          set_BM_PerBatchKey("");
          set_BM_Source("");
          set_BM_TotalKey("");
          set_BM_Errors([]);
        } else if (bm_mode === "outputControlled") {
          // source/totalKey are not used here
          set_BM_Source("");
          set_BM_TotalKey("");
          set_BM_Errors([]);
        }
        // reset alias guards on mode switch
        set_UserTouchedTotalKey(false);
        set_UserTouchedPerBatchKey(false);
      }, [bm_mode]);

      /**
       * 3) Keep selected source valid if the available list changes.
       *    get_SourceSelections is a state array of strings.
       */
      useEffect(() => {
        if (bm_mode !== "dataDriven") return;
        const list = get_SourceSelections ?? [];
        if (!list.includes(bm_source)) {
          set_BM_Source("");
        }
      }, [get_SourceSelections, bm_mode]);

      /**
       * 4) Alias helper → suggest key names (UI-only).
       *    Only suggests when user hasn't manually touched those fields.
       */
      useEffect(() => {
        if (!aliasInput.trim()) return;

        const alias = aliasInput.trim();
        const cap = alias.charAt(0).toUpperCase() + alias.slice(1);

        if (!userTouchedTotalKey && bm_mode === "dataDriven") {
          set_BM_TotalKey(`total${cap}`);
        }
        if (!userTouchedPerBatchKey && (bm_mode === "dataDriven" || bm_mode === "outputControlled")) {
          set_BM_PerBatchKey(`${alias}PerBatch`);
        }
      }, [aliasInput, bm_mode, userTouchedTotalKey, userTouchedPerBatchKey]);

      /**
       * 5) Build & validate the persisted batchingMap whenever inputs change.
       *    Emits the exact object your Prep JSON EF expects, or `undefined` if invalid.
       *    IMPORTANT: Call the React setter directly (no wrapper to avoid recursion).
       */
      useEffect(() => {
        const { ok, errors, map } = validateAndBuild_BatchingMap({
          mode: bm_mode,
          perBatchDefault: bm_perBatchDefault, // number | ""
          perBatchKey: bm_perBatchKey,
          source: bm_source,
          totalKey: bm_totalKey,
        });

        set_BM_Errors(errors);
        set_BatchingMapCard_ConstructedMap(ok ? map : undefined);
      }, [bm_mode, bm_perBatchDefault, bm_perBatchKey, bm_source, bm_totalKey]);


      //#endregion


    /*-----------------------------------------------
     ----- Field Map Library Preview useEffects -----
     -----------------------------------------------*/
     //#region
    useEffect(() => {
      const ordered = buildOrderedFilterMap(
        get_FilterMapCard_ConstructedFilterMap,
        get_FilterMapCard_FilterOrder
      );

      set_FieldMapPreview_Results((prev) => ({
        ...prev,
        baseTableMap: get_BaseTableCard_ConstructedBaseTableMap,
        sectionMaps: get_SectionMapCard_ConstructedMap,
        filterMap: ordered,
        filterOrder: get_FilterMapCard_FilterOrder,
        jsonOutputMap: get_SectionMapCard_ConstructedJsonOutputMap,
        nestedMappingKey: get_NestedMapCard_ConstructedMap,
        batchingMap: get_BatchingMapCard_ConstructedMap, 
      }));
    }, [
      get_BaseTableCard_ConstructedBaseTableMap,
      get_SectionMapCard_ConstructedMap,
      get_FilterMapCard_ConstructedFilterMap,
      get_FilterMapCard_FilterOrder,
      get_SectionMapCard_ConstructedJsonOutputMap,
      get_NestedMapCard_ConstructedMap,
      get_BatchingMapCard_ConstructedMap,
    ]);
    //#endregion


    /**********************************************************************************************
     * Define UI triggerable functions
     *********************************************************************************************/
    /*-----------------------------------------------
     ------- Base Config Table Selection Card -------
     ----------------- Event Hanlers ----------------
     -----------------------------------------------*/
    // #region
    // On change Select Config Table drop down
    const handleTableSelect = async (tableName: string) => {
    set_BaseTableCard_SelectedConfigTable(tableName);
    };
    // #endregion

    /*----------------------------------------------------------------------
    -------- Base Table Selection Card... checkbox array selections --------
    -------------------------- Event Hanlers -------------------------------
    ------------------------------------------------------------------------*/
    // #region
    // Check Box click updates
    const toggleTable = (tableKey: string) => {
    set_BaseTableCard_SelectedTables((prev) =>
        prev.includes(tableKey)
        ? prev.filter((key) => key !== tableKey)
        : [...prev, tableKey]
    );
    };
    // #endregion

    /*----------------------------------------------
    --------- filterMap DSL Definition Card --------
    ----------------- Event Hanlers ----------------
    -----------------------------------------------*/
    // #region
    // Source Table drop down on change handler
    const handleSourceTableSelect = async (value: string) => {
        set_FilterMapCard_SelectedDataSource(value);
    };

    // Add new filter rule
      const addFilter = () => {
        set_FilterMapCard_ConstructedFilters(prev => [
          ...prev,
          { field: "", operator: "=", matchTo: "", matchMode: "value" }
        ]);
      };

    // Removes a filter at the given index.
    const removeFilter = (index: number) => {
      const updatedFilters = get_FilterMapCard_ConstructedFilters.filter((_, i) => i !== index);
      set_FilterMapCard_ConstructedFilters(updatedFilters); //update the useState with added filter
    };

    // Updates the field, operator, or matchTo value of a filter rule.
    const updateFilter = (index: number, key: string, value: string) => {
        const updated = [...get_FilterMapCard_ConstructedFilters];
        updated[index][key] = value;
        set_FilterMapCard_ConstructedFilters(updated);
    };

    // Commit configured filters to Payload Preview
    const handleAddFilterToPayloadMap = async () => {
      const filterMapEntry = await generateFilterMap(
        get_FilterMapCard_OutputAlias,
        get_FilterMapCard_SelectedDataSource,
        get_FilterMapCard_ConstructedFilters
      );

        set_FilterMapCard_ConstructedFilterMap(prev => ({
          ...prev,
          ...filterMapEntry,
        }));
      };

    
    // Clears only the local draft (NOT the constructed filter map / preview)
    const resetAddDraft = () => {
      set_FilterMapCard_OutputAlias("");
      set_FilterMapCard_SelectedDataSource("");
      set_FilterMapCard_ConstructedFilters([{ field: "", operator: "=", matchTo: "" }]);
      set_FilterMapCard_MapPreview({}); // optional: keep empty until explicit push
    };

    // Always return an array of rules
    const normalizeFilterBy = (filterBy: any) => {
      if (!filterBy) return [];
      return Array.isArray(filterBy) ? filterBy : [filterBy];
    };

    // Ensure matchTo is a string for the input box
    const toLocalMatchTo = (v: any): string => {
      if (v && typeof v === "object") return JSON.stringify(v);
      if (v === undefined || v === null) return "";
      return String(v);
    };

    // Build our local draft shape from a map entry
    // assuming this is what your preload uses
    const toDraftFromMapEntry = (alias: string, entry: any) => {
      const source = entry?.source ?? "";
      const filters = (Array.isArray(entry?.filterBy) ? entry.filterBy : [entry?.filterBy]).filter(Boolean).map((r: any) => {
        const isRef = r?.matchTo && typeof r.matchTo === "object";
        return {
          field: r?.field ?? "",
          operator: r?.operator ?? "=",
          matchTo: isRef ? JSON.stringify(r.matchTo) : String(r?.matchTo ?? ""),
          matchMode: isRef ? "reference" : "value",
          refSource: isRef ? (r.matchTo.source?.replace(/Records$/, "") ?? "") : undefined, // strip “Records” if you store alias in UI
          refField:  isRef ? (r.matchTo.field ?? "") : undefined,
        };
      });
      return { alias, source, filters };
    };


    const toPreviewMatch = (v: string) => {
      const t = (v ?? "").trim();
      if (!t) return "";
      try { return JSON.parse(t); } catch { return t; }
    };

    const buildFilterMapDraftSync = (
      alias: string,
      source: string,
      filters: { field: string; operator: string; matchTo: string }[]
    ) => {
      if (!alias?.trim() || !source?.trim() || !Array.isArray(filters)) return null;

      const filterBy =
        filters.length === 1
          ? { field: filters[0].field, operator: filters[0].operator, matchTo: toPreviewMatch(filters[0].matchTo) }
          : filters.map(f => ({ field: f.field, operator: f.operator, matchTo: toPreviewMatch(f.matchTo) }));

      return { [alias]: { source, target: alias + "Records", filterBy } };
    };


    const moveAlias = (alias: string, direction: "up" | "down") => {
      set_FilterMapCard_FilterOrder((prev) => {
        const i = prev.indexOf(alias);
        if (i === -1) return prev;
        const j = direction === "up" ? i - 1 : i + 1;
        if (j < 0 || j >= prev.length) return prev; // out of bounds
        const next = [...prev];
        [next[i], next[j]] = [next[j], next[i]];
        return next;
      });
    };


    const deleteAlias = (alias: string) => {
    // remove from SoT
    set_FilterMapCard_ConstructedFilterMap((prev) => {
      if (!prev) return prev;
      const next = { ...prev };
      delete next[alias];
      return next;
    });

    // remove from order
    set_FilterMapCard_FilterOrder((prev) => prev.filter((a) => a !== alias));

    // if you're editing this alias, clear selection + draft
    if (get_FilterMapCard_SelectedEditAlias === alias) {
      set_FilterMapCard_SelectedEditAlias("");
      set_FilterMapCard_OutputAlias("");
      set_FilterMapCard_SelectedDataSource("");
      set_FilterMapCard_ConstructedFilters([{ field: "", operator: "=", matchTo: "" }]);
    }
  };

  const beginRename = (alias: string) => {
    set_FilterMapCard_RenamingAlias(alias);
    set_FilterMapCard_RenameInput(alias);
  };

  const cancelRename = () => {
    set_FilterMapCard_RenamingAlias(null);
    set_FilterMapCard_RenameInput("");
  };

  const confirmRename = () => {
    const oldAlias = get_FilterMapCard_RenamingAlias;
    const newAlias = get_FilterMapCard_RenameInput.trim();
    if (!oldAlias) return;

    // validation
    if (!newAlias) return; // (optional: show inline error/toast)
    if (newAlias !== oldAlias && get_FilterMapCard_ConstructedFilterMap?.[newAlias]) return; // duplicate

    // mutate SoT
    set_FilterMapCard_ConstructedFilterMap((prev) => {
      const next = { ...(prev || {}) };
      const entry = next[oldAlias];
      if (!entry) return prev;

      delete next[oldAlias];
      next[newAlias] = { ...entry, target: newAlias + "Records" };
      return next;
    });

    // mutate order
    set_FilterMapCard_FilterOrder((prev) =>
      prev.map((a) => (a === oldAlias ? newAlias : a))
    );

    // keep Edit selection/draft in sync
    if (get_FilterMapCard_SelectedEditAlias === oldAlias) {
      set_FilterMapCard_SelectedEditAlias(newAlias);
      set_FilterMapCard_OutputAlias(newAlias);
    }

    set_FilterMapCard_RenamingAlias(null);
    set_FilterMapCard_RenameInput("");
  };


  const buildOrderedFilterMap = (
    map: Record<string, any> = {},
    order: string[] = []
  ) => {
    const out: Record<string, any> = {};
    // first: aliases in the desired order
    for (const alias of order) if (map[alias]) out[alias] = map[alias];
    // then: any aliases not yet in the order (safety)
    for (const alias of Object.keys(map)) if (!out[alias]) out[alias] = map[alias];
    return out;
  };


  const setFilterMatchMode = (index: number, mode: "value" | "reference") => {
    const next = [...get_FilterMapCard_ConstructedFilters];
    next[index].matchMode = mode;

    if (mode === "reference") {
      // lock to '=' in v1
      next[index].operator = "=";

      // seed a JSON object in matchTo using any existing refSource/refField
      const src = next[index].refSource?.trim();
      const fld = next[index].refField?.trim();
      const dslSource = src?.trim() || undefined;
      next[index].matchTo =
        src && fld ? JSON.stringify({ source: dslSource, field: fld })
                  : JSON.stringify({});
    } else {
      // switching back to value mode — keep whatever matchTo string user had typed before
      // just drop ref metadata to keep state clean
      delete next[index].refSource;
      delete next[index].refField;
    }

    set_FilterMapCard_ConstructedFilters(next);
  };



  const ensureFieldsFor = async (sourceAlias: string) => {
    if (get_FilterMapCard_FieldMap[sourceAlias]) return;
    const tableName = get_FieldMapPreview_Results?.baseTableMap?.[sourceAlias]?.table_name;
    if (!tableName) return;
    const fields = await fetchTableFields(
      tableName,
      get_BaseTableCard_ConfigTableData,
      "table_name",
      "filterable_columns"
    );
    set_FilterMapCard_FieldMap((prev) => ({ ...prev, [sourceAlias]: fields }));
  };

  const setFilterRefSource = async (index: number, sourceAlias: string) => {
    const next = [...get_FilterMapCard_ConstructedFilters];
    next[index].refSource = sourceAlias;

    // keep matchTo JSON in sync
    const fld = next[index].refField?.trim();
    const dslSource = sourceAlias; // or just sourceAlias if you prefer
    next[index].matchTo = fld
      ? JSON.stringify({ source: dslSource, field: fld })
      : JSON.stringify({ source: dslSource });

    set_FilterMapCard_ConstructedFilters(next);
    // fetch fields for the chosen reference source if not cached
    await ensureFieldsFor(sourceAlias);
  };

  const setFilterRefField = (index: number, field: string) => {
    const next = [...get_FilterMapCard_ConstructedFilters];
    next[index].refField = field;

    const srcAlias = next[index].refSource?.trim();
    const dslSource = srcAlias ? srcAlias : undefined; // or srcAlias directly
    next[index].matchTo = dslSource
      ? JSON.stringify({ source: dslSource, field })
      : JSON.stringify({ field });

    set_FilterMapCard_ConstructedFilters(next);
  };


  const isValidDraft = () => {
    const alias = get_FilterMapCard_OutputAlias?.trim();
    const source = get_FilterMapCard_SelectedDataSource?.trim();
    const rows = get_FilterMapCard_ConstructedFilters || [];

    if (!alias || !source || rows.length === 0) return false;

    // At least one usable rule:
    return rows.some((r) => {
      const hasFieldAndOp = r?.field?.trim() && r?.operator?.trim();
      if (!hasFieldAndOp) return false;

      // If reference mode, both ref picks must be set
      if (r?.matchMode === "reference") {
        return !!(r?.refSource?.trim() && r?.refField?.trim());
      }

      // Value mode: allow empty matchTo for now
      return true;
    });
  };

  // 1) If UI sends a target (e.g., "ChapterRecords"), map it back to its alias.
//    Otherwise (base alias), return as-is.
const normalizeSourceKey = (key: string): string => {
  if (get_FieldMapPreview_Results?.baseTableMap?.[key]) return key; // base alias
  for (const [alias, entry] of Object.entries(get_FilterMapCard_ConstructedFilterMap ?? {})) {
    const target = entry?.target ?? `${alias}Records`;
    if (target === key) return alias;
  }
  return key; // fallback
};

// 2) Walk filterMap→source→… until you hit a base alias. Returns null if unresolved/cycle.
const resolveBaseAlias = (alias: string): string | null => {
  const visited = new Set<string>();
  let cur = alias;
  while (true) {
    if (visited.has(cur)) return null; // cycle
    visited.add(cur);
    if (get_FieldMapPreview_Results?.baseTableMap?.[cur]) return cur; // base
    const fm = get_FilterMapCard_ConstructedFilterMap?.[cur];
    if (!fm) return null; // unknown
    cur = fm.source; // follow to next alias
  }
};

// 3) Fetch fields for the ultimate base and cache them under BOTH the base and the selected alias.
const getFieldsForSource = async (alias: string): Promise<string[] | null> => {
  const base = resolveBaseAlias(alias);
  if (!base) return null;
  const cached = get_FilterMapCard_FieldMap[alias] || get_FilterMapCard_FieldMap[base];
  if (cached) {
    // ensure alias also points to the same list
    if (!get_FilterMapCard_FieldMap[alias]) {
      set_FilterMapCard_FieldMap(prev => ({ ...prev, [alias]: cached }));
    }
    return cached;
  }
  const tableName = get_FieldMapPreview_Results?.baseTableMap?.[base]?.table_name;
  if (!tableName) return null;
  const fields = await fetchTableFields(tableName, get_BaseTableCard_ConfigTableData, "table_name", "filterable_columns");
  set_FilterMapCard_FieldMap(prev => ({ ...prev, [base]: fields, [alias]: fields }));
  return fields;
};

// Filter Map card only
const handle_FilterMapCard_SourceSelect = async (value: string) => {
  const alias = normalizeSourceKey(value);   // target → alias (or passthrough for base)
  set_FilterMapCard_SelectedDataSource(alias);
  await getFieldsForSource(alias);           // resolves to base + caches fields under both keys
};






    // #endregion



  /*----------------------------------------------
    --------------- Seciton Map Card --------------
    ----------------- Event Hanlers ----------------
    -----------------------------------------------*/
    // #region

    /**
     * Toggles a field in the section's selected fields array.
     * If the field is already present, it will be removed.
     * If it's not present, it will be added with default alias/type.
     */
    const toggleSectionField = (fieldName: string) => {
      set_SectionMapCard_SelectedFields((prev) => {
        // Check if the field already exists in the array
        const exists = prev.find(entry => entry.field === fieldName);

        if (exists) {
          // If it exists, remove it by filtering it out
          return prev.filter(entry => entry.field !== fieldName);
        } else {
          // If it doesn't exist, add it with default values
          return [
            ...prev,
            {
              field: fieldName,         // Actual field name from the table
              alias: fieldName,         // Default alias same as field name (can be changed later)
              fieldType: "text"         // Default type; you can change this based on metadata later
            }
          ];
        }
      });
    };


    // Build a single section map object from the selected rows
    function buildSectionMapEntry(
      source: string,
      rows: { field: string; alias: string; fieldType: string }[],
      conditional: boolean
    ): Record<string, any> | null {
      if (!source) {
        console.warn("⚠️ No source selected for this section.");
        return null;
      }
      if (!rows?.length) {
        console.warn("⚠️ No fields selected.");
        return null;
      }

      const out: Record<string, any> = {};
      const seen = new Set<string>();

      for (const r of rows) {
        const key = (r.alias?.trim() || r.field?.trim());
        if (!key) continue;

        if (seen.has(key)) {
          console.warn(`⚠️ Duplicate JSON key "${key}" in this section; keeping first.`);
          continue;
        }
        seen.add(key);

        const fieldType = (r.fieldType || "text") as "text" | "jsonParsed" | "nestedMapping";
        const entry: any = { fieldType };

        if (fieldType !== "nestedMapping") {
          if (!r.field) {
            console.warn(`⚠️ "${key}" requires a Source Field for type "${fieldType}". Skipping.`);
            continue;
          }
          entry.field = r.field;
        }
        // For nestedMapping, we intentionally DO NOT include `field`

        out[key] = entry;
      }

      if (Object.keys(out).length === 0) {
        console.warn("⚠️ Section has no valid fields after validation.");
        return null;
      }

      return out;
    }


    // onClick of Add Section Map button, builds the seciton map
    const handleAddSectionMap = async () => {
      if (get_SectionMapCard_ConstructedMap[get_SectionMapCard_SectionAilias?.trim()]) {
        console.warn("❌ A section with that alias already exists.");
        return;
      }

      // Step 1: Validate section alias
      const sectionKey = get_SectionMapCard_SectionAilias.trim();
      if (!sectionKey) {
        console.warn("❌ Section alias is required.");
        return;
      }

      // Step 2: Build the section map entry using selected field configs
      const sectionEntry = await buildSectionMapEntry(
        get_SectionMapCard_SelectedSource,
        get_SectionMapCard_SelectedFields,
        get_SectionMapCard_ConditionalSwitch
      );

      // Step 3: If invalid, exit early
      if (!sectionEntry) {
        console.warn("❌ Could not create section entry.");
        return;
      }

      // Step 4: Inject section entry into the main constructed map
        // Update sectionMaps
        set_SectionMapCard_ConstructedMap((prev) => ({
          ...prev,
          [sectionKey]: sectionEntry,
        }));

        // Update jsonOutputMap to reference the section
        set_SectionMapCard_ConstructedJsonOutputMap((prev) => ({
          ...prev,
          [sectionKey]: {
            source: get_SectionMapCard_SelectedSource,
            sectionMapKey: sectionKey,
            conditional: get_SectionMapCard_ConditionalSwitch,
          },
        }));
    };

    /**
     * Hydrate Edit form from saved maps:
     * - fields from sectionMaps (get_SectionMapCard_ConstructedMap[alias])
     * - source/conditional from jsonOutputMap (get_SectionMapCard_ConstructedJsonOutputMap[alias])
     */
    const handleSelectEditAlias = (alias: string) => {
      set_SectionMapCard_SelectedEditAlias(alias);

      const fieldsObj = get_SectionMapCard_ConstructedMap?.[alias] ?? {};               // sectionMaps
      const meta      = get_SectionMapCard_ConstructedJsonOutputMap?.[alias] ?? {};     // jsonOutputMap

      // Section name (allow rename)
      set_SectionMapCard_SectionAilias(alias);

      // Validate source against base tables + filter targets
      const filterTargets =
        Object.values(get_FilterMapCard_ConstructedFilterMap ?? {})
          .map((f: any) => f?.target)
          .filter(Boolean);

      const src = meta?.source ?? "";
      const isValidSource =
        src &&
        (get_SectionMapCard_BaseTablesOptions.includes(src) || filterTargets.includes(src));

      if (!isValidSource) {
        console.warn("⚠️ Hydrate: source not in options:", src);
      }
      set_SectionMapCard_SelectedSource(isValidSource ? src : "");

      // Conditional switch
      set_SectionMapCard_ConditionalSwitch(Boolean(meta?.conditional));

      // Fields: object map -> normalized array [{ field, alias, fieldType }]
      const hydratedFields = Object.entries(fieldsObj).map(([aliasKey, val]: [string, any]) => ({
        // uiField fallback allows nestedMapping entries (which omit 'field') to hydrate the checkbox row
        field: val?.field ?? val?.uiField ?? "",

        alias: aliasKey,
        fieldType: (val?.fieldType ?? val?.type ?? "text") as SectionMapCard_FieldType,
      }));

      set_SectionMapCard_SelectedFields(hydratedFields);
    };



    /**
     * Persist current form values into both constructed maps.
     * Handles alias rename by removing the old key and inserting the new key.
     * Keeps the Edit dropdown in sync by setting SelectedEditAlias to the new key.
     */
    const handleUpdateSectionMap = (originalAlias: string) => {
      const newKey = get_SectionMapCard_SectionAilias.trim();
      if (!newKey) return console.warn("❌ Section alias required");
      if (!get_SectionMapCard_SelectedSource) return console.warn("❌ Source table required");
      if (get_SectionMapCard_SelectedFields.length === 0) return console.warn("❌ Select at least one field");


      const aliases = get_SectionMapCard_SelectedFields.map(
        e => (e.alias?.trim() || e.field).toLowerCase()
      );
      const seen = new Set<string>();
      const dup = aliases.find(a => (seen.has(a) ? true : (seen.add(a), false)));
      if (dup) {
        console.warn("❌ Duplicate field alias. Each alias must be unique within the section.");
        return;
      }


      const fieldsObj = toFieldsObject(get_SectionMapCard_SelectedFields);

      // sectionMaps
      set_SectionMapCard_ConstructedMap(prev => {
        const copy = { ...prev };
        if (originalAlias && originalAlias !== newKey) delete copy[originalAlias];
        copy[newKey] = fieldsObj;
        return copy;
      });

      // jsonOutputMap
      set_SectionMapCard_ConstructedJsonOutputMap(prev => {
        const copy = { ...prev };
        if (originalAlias && originalAlias !== newKey) delete copy[originalAlias];
        copy[newKey] = {
          source: get_SectionMapCard_SelectedSource,
          sectionMapKey: newKey,
          conditional: get_SectionMapCard_ConditionalSwitch,
          conditionValue: get_SectionMapCard_ConditionValue,
        };
        return copy;
      });

      // keep dropdown in sync if alias was renamed
      set_SectionMapCard_SelectedEditAlias(newKey);
    };

    //used in selection alias naming
    const setSectionFieldAlias = (fieldName: string, newAlias: string) => {
      set_SectionMapCard_SelectedFields(prev =>
        prev.map(entry =>
          entry.field === fieldName ? { ...entry, alias: newAlias } : entry
        )
      );
    };

    //used to assign the fieldType for the selected field in section Map
    function setSectionFieldType(fieldName: string, nextType: SectionMapCard_FieldType) {
      set_SectionMapCard_SelectedFields(prev =>
        prev.map(row =>
          row.field === fieldName
            ? {
                ...row,
                fieldType: nextType,
                // optional: if you want to visually ignore source field for nestedMapping
                // field: nextType === "nestedMapping" ? row.field : row.field,
              }
            : row
        )
      );
    }

    // #endregion


    /*----------------------------------------------
    --------------- Nested Map Card --------------
    ----------------- Event Hanlers ----------------
    -----------------------------------------------*/
    //#region
    
    function handleAddNestedMapping() {
      const sel = get_NestedMapCard_SelectedAlias; // { section, field }
      if (!sel?.field?.trim()) {
        console.warn("⚠️ Choose a nested alias first.");
        return;
      }

      const aliasKey = sel.field.trim();
      const recordSource = (get_NestedMapCard_RecordSource || "").trim();
      const linkFieldInParent = (get_NestedMapCard_LinkFieldInParent || "").trim();
      const childIDField = (get_NestedMapCard_ChildIDField || "ID").trim();
      const fieldMappingKey = (get_NestedMapCard_FieldMappingKey || "").trim();
      const sortKey = (get_NestedMapCard_SortKey || "").trim();

      // Guard: alias must truly be a nestedMapping field in its section
      const isNested =
        (get_SectionMapCard_ConstructedMap?.[sel.section]?.[aliasKey]?.fieldType ??
          get_SectionMapCard_ConstructedMap?.[sel.section]?.[aliasKey]?.type) ===
        "nestedMapping";
      if (!isNested) {
        console.warn(`⚠️ "${sel.section}.${aliasKey}" is not a nestedMapping field.`);
        return;
      }

      // Required fields
      if (!recordSource) {
        console.warn("⚠️ recordSource is required.");
        return;
      }
      if (!linkFieldInParent) {
        console.warn("⚠️ linkFieldInParent is required.");
        return;
      }
      if (!fieldMappingKey) {
        console.warn("⚠️ fieldMappingKey is required.");
        return;
      }

      // Prevent duplicate adds for same alias
      if (get_NestedMapCard_ConstructedMap[aliasKey]) {
        console.warn(`⚠️ A nestedMappingKey for "${aliasKey}" already exists.`);
        return;
      }

      // Save
      set_NestedMapCard_ConstructedMap(prev => ({
        ...prev,
        [aliasKey]: {
          recordSource,
          linkFieldInParent,
          childIDField: childIDField || "ID",
          fieldMappingKey,
          ...(sortKey ? { sortKey } : {}),
        },
      }));

      // (Optional) clear form bits, keep alias selected if you want to edit immediately
      // set_NestedMapCard_RecordSource("");
      // set_NestedMapCard_LinkFieldInParent("");
      // set_NestedMapCard_ChildIDField("ID");
      // set_NestedMapCard_FieldMappingKey("");
      // set_NestedMapCard_SortKey("");
    }


    // When an edit alias is chosen, also set {section, field} for parent field loading
    function handleSelectEditNestedAlias(alias: string) {
      set_NestedMapCard_SelectedEditAlias(alias);

      // Try to find which section owns this nested field for parent-source resolution
      const match = get_NestedMapCard_AliasOptions.find(o => o.field === alias);
      if (match) {
        set_NestedMapCard_SelectedAlias({ section: match.section, field: alias });
      } else {
        // Fallback: still keep field, section unknown (parent field list will be empty until user re-adds)
        set_NestedMapCard_SelectedAlias({ section: "", field: alias });
      }
    }

    function handleUpdateNestedMapping() {
      const alias = get_NestedMapCard_SelectedEditAlias?.trim();
      if (!alias) return;

      const recordSource = (get_NestedMapCard_RecordSource || "").trim();
      const linkFieldInParent = (get_NestedMapCard_LinkFieldInParent || "").trim();
      const childIDField = (get_NestedMapCard_ChildIDField || "ID").trim();
      const fieldMappingKey = (get_NestedMapCard_FieldMappingKey || "").trim();
      const sortKey = (get_NestedMapCard_SortKey || "").trim();

      if (!recordSource || !linkFieldInParent || !fieldMappingKey) {
        console.warn("⚠️ recordSource, linkFieldInParent, and fieldMappingKey are required.");
        return;
      }

      set_NestedMapCard_ConstructedMap(prev => ({
        ...prev,
        [alias]: {
          recordSource,
          linkFieldInParent,
          childIDField: childIDField || "ID",
          fieldMappingKey,
          ...(sortKey ? { sortKey } : {}),
        },
      }));
    }

    function handleDeleteNestedMapping() {
      const alias = get_NestedMapCard_SelectedEditAlias?.trim();
      if (!alias) return;
      set_NestedMapCard_ConstructedMap(prev => {
        const next = { ...(prev || {}) };
        delete next[alias];
        return next;
      });
      // Reset form
      set_NestedMapCard_SelectedEditAlias("");
      set_NestedMapCard_SelectedAlias(null);
      set_NestedMapCard_RecordSource("");
      set_NestedMapCard_LinkFieldInParent("");
      set_NestedMapCard_ChildIDField("ID");
      set_NestedMapCard_FieldMappingKey("");
      set_NestedMapCard_SortKey("");
    }

    //#endregion


    /*----------------------------------------------
    --------------- Batching Map Card --------------
    ----------------- Event Hanlers ----------------
    -----------------------------------------------*/
    //#region
    // ---------- Batching Map Card • HANDLERS / HELPERS ----------

    /** Coerce numeric input to number-or-empty */
    function toPositiveIntOrEmpty(v: string): number | "" {
      if (v === "") return "";
      const n = Number(v);
      return Number.isFinite(n) && n > 0 ? Math.floor(n) : "";
    }

    /**
     * Validate current local inputs and build the persisted map the EF expects.
     * Returns { ok, errors, map }.
     */
    function validateAndBuild_BatchingMap(args: {
      mode: BatchingMode;
      perBatchDefault: number | "";
      perBatchKey: string;
      source: string;
      totalKey: string;
    }): { ok: boolean; errors: string[]; map?: BatchingMapPersisted } {
      const { mode, perBatchDefault, perBatchKey, source, totalKey } = args;
      const errors: string[] = [];

      if (!mode) errors.push("Mode is required.");

      if (mode === "noBatching") {
        return { ok: true, errors: [], map: { mode: "noBatching" } };
      }

      // outputControlled & dataDriven both require perBatchDefault and perBatchKey
      if (perBatchDefault === "" || perBatchDefault <= 0) {
        errors.push("Per-batch count must be a positive integer.");
      }
      if (!perBatchKey.trim()) {
        errors.push("Per-batch key is required.");
      }

      if (mode === "outputControlled") {
        if (errors.length) return { ok: false, errors };
        return {
          ok: true,
          errors: [],
          map: {
            mode: "outputControlled",
            perBatchDefault: Number(perBatchDefault),
            perBatchKey: perBatchKey.trim(),
          },
        };
      }

      if (mode === "dataDriven") {
        if (!source.trim()) errors.push("Source is required for data-driven batching.");
        if (!totalKey.trim()) errors.push("Total key is required for data-driven batching.");

        if (errors.length) return { ok: false, errors };
        return {
          ok: true,
          errors: [],
          map: {
            mode: "dataDriven",
            source: source.trim(),
            totalKey: totalKey.trim(),
            perBatchKey: perBatchKey.trim(),
            perBatchDefault: Number(perBatchDefault),
          },
        };
      }

      errors.push(`Unrecognized mode: ${mode}`);
      return { ok: false, errors };
    }

    /** Field change handlers */
    function onChange_Mode(v: BatchingMode) {
      set_BM_Mode(v);
      // reset manual-touch guards when mode changes
      set_UserTouchedTotalKey(false);
      set_UserTouchedPerBatchKey(false);
    }

    function onChange_Alias(v: string) {
      set_AliasInput(v);
    }

    function onChange_PerBatchDefault(v: string) {
      set_BM_PerBatchDefault(toPositiveIntOrEmpty(v));
    }

    function onChange_PerBatchKey(v: string) {
      set_BM_PerBatchKey(v);
      set_UserTouchedPerBatchKey(true);
    }

    function onChange_Source(v: string) {
      set_BM_Source(v);
    }

    function onChange_TotalKey(v: string) {
      set_BM_TotalKey(v);
      set_UserTouchedTotalKey(true);
    }

    /** Optional clear */
    function clear_BatchingMapCard() {
      set_BM_Mode("noBatching");
      set_BM_PerBatchDefault("");
      set_BM_PerBatchKey("");
      set_BM_Source("");
      set_BM_TotalKey("");
      set_AliasInput("");
      set_UserTouchedTotalKey(false);
      set_UserTouchedPerBatchKey(false);
      set_BM_Errors([]);
      set_BatchingMapCard_ConstructedMap(undefined);
    }

    //#endregion


    /*----------------------------------------------
    ------------- Generate Payload Card ------------
    ----------------- Event Hanlers ----------------
    -----------------------------------------------*/
    // #region
    /**
     * Handle payload generation for EF preview.
     * Prevents running if the selected section is empty.
     */
    const handleGeneratePayload = async () => {
      const efName = "ef_step_assistant_PrepJSON";
      const preview = get_FieldMapPreview_Results || {};

      const hasBaseTableMap  = !!(preview.baseTableMap && Object.keys(preview.baseTableMap).length);
      const hasSectionMaps   = !!(preview.sectionMaps && Object.keys(preview.sectionMaps).length);
      const hasJsonOutputMap = !!(preview.jsonOutputMap && Object.keys(preview.jsonOutputMap).length);

      if (!hasBaseTableMap) {
        set_PayloadPreviewCard_PreviewText("⚠️ Populate baseTableMap before generating.");
        return;
      }
      if (!hasSectionMaps) {
        set_PayloadPreviewCard_PreviewText("⚠️ Populate sectionMaps before generating.");
        return;
      }
      if (!hasJsonOutputMap) {
        set_PayloadPreviewCard_PreviewText("⚠️ Populate jsonOutputMap before generating.");
        return;
      }

      const efPayload = {
        mode: "manual",
        bodyNarrativeProjectID: get_PayloadPreviewCard_NarrativeProjectID,
        bodyfieldMapLibrary: {
          baseTableMap: preview.baseTableMap,
          jsonOutputMap: preview.jsonOutputMap,
          sectionMaps: preview.sectionMaps,
          filterMap: preview.filterMap ?? {},
          nestedMappingKey: preview.nestedMappingKey ?? {},
          batchingMap: get_BatchingMapCard_ConstructedMap,
        },
      };

      try {
        set_PayloadPreviewCard_PreviewText("⏳ Generating payload with PrepJSON…");

        // run_EF returns the parsed JSON (or throws on error)
        const data = await run_EF(efName, efPayload);

        set_PayloadPreviewCard_PreviewText(data);
      } catch (err: any) {
        // err.message already includes status + server text per your run_EF
        console.error("❌ run_EF error:", err);
        set_PayloadPreviewCard_PreviewText(`❌ ${String(err?.message ?? err)}`);
      }
    };





    const handleClearView = async () => {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      set_BaseTableCard_SelectedConfigTable('');
      set_BaseTableCard_ConstructedBaseTableMap({});
      set_BaseTableCard_ConfigTableData([]);
      set_BaseTableCard_SelectedTables([]);
      set_FilterMapCard_OutputAlias('');
      set_FilterMapCard_SelectedDataSource('');
      set_FilterMapCard_ConstructedFilters([{ field: '', operator: '=', matchTo: '' }]);
      set_FilterMapCard_MapPreview({});
      set_SectionMapCard_BaseTablesOptions([]);
      set_SectionMapCard_SelectedSource("");
      set_SectionMapCard_FieldMap({});
      set_SectionMapCard_SelectedFields([]);
      set_SectionMapCard_ConditionalSwitch(false);
      set_SectionMapCard_ConstructedMap({});
      set_SectionMapCard_ConstructedJsonOutputMap({});
      set_FilterMapCard_FilterOrder([]);
      set_FilterMapCard_ConstructedFilterMap({});
      set_FieldMapPreview_Results({
        baseTableMap: {},
        jsonOutputMap: {},
        filterMap: {},
        sectionMaps: {},
        nestedMappingKey: {},
      });
      set_NestedMapCard_SelectedAlias(null);
      set_NestedMapCard_RecordSource("");
      set_NestedMapCard_LinkFieldInParent("");
      set_NestedMapCard_ChildIDField("ID");
      set_NestedMapCard_FieldMappingKey("");
      set_NestedMapCard_SortKey("");
      set_NestedMapCard_ConstructedMap([]);
    };


    // Begin inline rename for a section
    const beginSectionRename = (alias: string) => {
      set_SectionMapCard_RenamingAlias(alias);
      set_SectionMapCard_RenameInput(alias);
    };

    // Cancel rename
    const cancelSectionRename = () => {
      set_SectionMapCard_RenamingAlias(null);
      set_SectionMapCard_RenameInput("");
    };

    // Commit rename (atomic across maps + order)
    const commitSectionRename = () => {
      const oldKey = get_SectionMapCard_RenamingAlias;
      const newKey = get_SectionMapCard_RenameInput.trim();

      if (!oldKey) return;                          // no-op
      if (!newKey) return console.warn("❌ Section alias required");
      if (oldKey === newKey) {                      // nothing changed
        set_SectionMapCard_RenamingAlias(null);
        return;
      }
      if (get_SectionMapCard_ConstructedMap[newKey]) {
        return console.warn("❌ A section with that alias already exists.");
      }

      // 1) sectionMaps: move oldKey -> newKey
      set_SectionMapCard_ConstructedMap(prev => {
        if (!prev[oldKey]) return prev;
        const copy = { ...prev };
        const value = copy[oldKey];
        delete copy[oldKey];
        copy[newKey] = value;
        return copy;
      });

      // 2) jsonOutputMap: move oldKey -> newKey + update sectionMapKey
      set_SectionMapCard_ConstructedJsonOutputMap(prev => {
        const copy = { ...prev };
        const meta = copy[oldKey] ?? {};
        if (oldKey in copy) delete copy[oldKey];
        copy[newKey] = { ...meta, sectionMapKey: newKey };
        return copy;
      });

      // 3) Order: replace entry
      set_SectionMapCard_SectionOrder(prev =>
        prev.map(k => (k === oldKey ? newKey : k))
      );

      // 4) Sync Edit selection & alias input if currently editing this section
      if (get_SectionMapCard_SelectedEditAlias === oldKey) {
        set_SectionMapCard_SelectedEditAlias(newKey);
        set_SectionMapCard_SectionAilias(newKey);
      }

      // 5) Clear rename UI state
      set_SectionMapCard_RenamingAlias(null);
      set_SectionMapCard_RenameInput("");
    };


    // Delete a section everywhere (maps + order) and clean up edit state if needed
    const deleteSection = (alias: string, { confirmPrompt = true } = {}) => {
      if (!alias) return;

      // Optional safety prompt
      if (confirmPrompt) {
        const ok = window.confirm(`Delete section "${alias}"? This cannot be undone.`);
        if (!ok) return;
      }

      // 1) Remove from sectionMaps
      set_SectionMapCard_ConstructedMap(prev => {
        if (!prev?.[alias]) return prev;
        const copy = { ...prev };
        delete copy[alias];
        return copy;
      });

      // 2) Remove from jsonOutputMap
      set_SectionMapCard_ConstructedJsonOutputMap(prev => {
        if (!prev?.[alias]) return prev;
        const copy = { ...prev };
        delete copy[alias];
        return copy;
      });

      // 3) Remove from order
      set_SectionMapCard_SectionOrder(prev => prev.filter(k => k !== alias));

      // 4) If currently editing this section, clear the edit form
      if (get_SectionMapCard_SelectedEditAlias === alias) {
        set_SectionMapCard_SelectedEditAlias("");
        set_SectionMapCard_SectionAilias("");
        set_SectionMapCard_SelectedSource("");
        set_SectionMapCard_SelectedFields([]);
        set_SectionMapCard_ConditionalSwitch(false);
      }
    };


    // ---- reorder helpers ----
    const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(n, max));

    const moveItem = <T,>(arr: T[], from: number, to: number): T[] => {
      if (from === to || from < 0 || to < 0 || from >= arr.length || to >= arr.length) return arr;
      const copy = arr.slice();
      const [item] = copy.splice(from, 1);
      copy.splice(to, 0, item);
      return copy;
    };

    // Move a section to a specific index
    const moveSectionToIndex = (alias: string, toIndex: number) => {
      set_SectionMapCard_SectionOrder(prev => {
        const fromIndex = prev.indexOf(alias);
        if (fromIndex === -1) return prev;
        const target = clamp(toIndex, 0, prev.length - 1);
        return moveItem(prev, fromIndex, target);
      });
    };

    // Convenience: move up / down by one
    const moveSectionUp = (alias: string) => {
      set_SectionMapCard_SectionOrder(prev => {
        const i = prev.indexOf(alias);
        if (i <= 0) return prev;
        return moveItem(prev, i, i - 1);
      });
    };

    const moveSectionDown = (alias: string) => {
      set_SectionMapCard_SectionOrder(prev => {
        const i = prev.indexOf(alias);
        if (i === -1 || i >= prev.length - 1) return prev;
        return moveItem(prev, i, i + 1);
      });
    };

//#endregion


  /*----------------------------------------------
      ------------- Field Map Library ------------
      ----------------- Event Hanlers ----------------
      -----------------------------------------------*/
      //#region
      const copyLibraryToClipboard = async () => {
        const json = JSON.stringify(get_FieldMapPreview_Results ?? {}, null, 2);
        await navigator.clipboard.writeText(json);
        setLibraryCopied(true);
        setTimeout(() => setLibraryCopied(false), 1500);
      };


const handleImportReplace = () => {
  let payload: any;
  try {
    payload = JSON.parse(importText || "{}");
  } catch (e) {
    console.warn("❌ Invalid JSON:", e);
    return;
  }

  // Extract with guards
  const baseTableMap =
    payload && typeof payload.baseTableMap === "object" ? payload.baseTableMap : {};
  const sectionMaps =
    payload && typeof payload.sectionMaps === "object" ? payload.sectionMaps : {};
  const jsonOutputMap =
    payload && typeof payload.jsonOutputMap === "object" ? payload.jsonOutputMap : {};
  const rawFilterMap = payload?.filterMap ?? payload?.filterMaps ?? {};
  const filterMap =
    rawFilterMap && typeof rawFilterMap === "object" ? rawFilterMap : {};
  const filterOrder = Array.isArray(payload?.filterOrder) && payload.filterOrder.length
    ? payload.filterOrder
    : Object.keys(filterMap);
    const nestedMappingKey =
    payload && typeof payload.nestedMappingKey === "object" ? payload.nestedMappingKey : {};

  // SoTs + options
  set_BaseTableCard_ConstructedBaseTableMap(baseTableMap);
  set_SectionMapCard_ConstructedMap(sectionMaps);
  set_SectionMapCard_ConstructedJsonOutputMap(jsonOutputMap);
  set_FilterMapCard_ConstructedFilterMap(filterMap);
  set_FilterMapCard_FilterOrder(filterOrder);
  set_SectionMapCard_BaseTablesOptions(Object.keys(baseTableMap));
  set_SectionMapCard_SectionOrder?.(Object.keys(sectionMaps));
  set_NestedMapCard_ConstructedMap(nestedMappingKey);

  // Select all base tables by table_name (switch to aliases if your state expects aliases)
  const tableNames = Array.from(
    new Set(
      Object.values(baseTableMap)
        .map((v: any) => (typeof v?.table_name === "string" ? v.table_name.trim() : ""))
        .filter(Boolean)
    )
  );
  set_BaseTableCard_SelectedTables(tableNames);

  //Set the section map card fields blank, user needs to make selections an it will then populate in edit
    set_SectionMapCard_SelectedEditAlias("");
    set_SectionMapCard_SelectedSource("");
    set_SectionMapCard_SelectedFields([]);
    set_SectionMapCard_ConditionalSwitch(false);


  // Close & reset dialog
  setImportOpen(false);
  setImportText("");
};


    //#endregion

/**************************************************************************************************************** */
// *********************************Define UI View(visual components)*********************************
/*************************************************************************************************************** */
    return (
        <div className="flex flex-row gap-4 w-full bg-white-50 p-6">
{/* LEFT – Primary Scrollable Area */}
            <div className="w-2/3 min-w-[300px] pr-4">
                <div className="p-4 space-y-6">
  {/* BASE TABLE CARD */}
                <Card>
                    <CardContent className="space-y-4">
                      <Styled_CardHeader>Base Table Selection</Styled_CardHeader>
      {/* Config Table Dropdown */}
                      <Label>Select a Config Table to Load Mappings</Label>
                      <Select value={get_BaseTableCard_SelectedConfigTable} onValueChange={handleTableSelect}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a config table" />
                        </SelectTrigger>
                        <SelectContent>
                          {configBaseTables.map(({ label, tableName }) => (
                            <SelectItem key={tableName} value={tableName}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

      {/* Display active config */}
                      {get_BaseTableCard_SelectedConfigTable && (
                        <div className="text-sm text-muted-foreground">
                          Viewing config from: <strong>{get_BaseTableCard_SelectedConfigTable}</strong>
                        </div>
                      )}

      {/* Base Table Selector */}
                      {get_BaseTableCard_ConfigTableData.length > 0 && (
                        <>
                        <Separator className="my-6" />
                          <Label className="font-normal mt-4">Base Table Selection</Label>
                          <br />
                          <Label className="font-bold mt-4">Select Tables to Include in Payload Base Tables</Label>
                          <div className="space-y-2">
                            {[...get_BaseTableCard_ConfigTableData]
                              .sort((a, b) => a.display_order - b.display_order)
                              .map((row: any) => (
                                <div key={row.table_name} className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    checked={get_BaseTableCard_SelectedTables.includes(row.table_name)}
                                    onChange={() => toggleTable(row.table_name)}
                                    className="accent-primary"
                                  />
                                  <span>{row.table_name}</span>
                                </div>
                              ))}
                          </div>
                        </>
                      )}
                    </CardContent>
                </Card>


{/* filterMap construction card */}
                <Card className="p-4 mt-4">
                  <CardHeader>
                    <Styled_CardHeader>Filtered Records</Styled_CardHeader>
                    <div className="mt-2 flex justify-center">
                      <Tabs
                        value={get_FilterMapCard_Mode}
                        onValueChange={(v) => set_FilterMapCard_Mode(v as "add" | "edit" | "manage")}
                      >
                        <TabsList className="justify-center">
                          <TabsTrigger value="add">Add</TabsTrigger>
                          <TabsTrigger value="edit">Edit</TabsTrigger>
                          <TabsTrigger value="manage">Manage</TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </div>
                    <CardTitle>Create Custom Filtered Recordset</CardTitle>
                    <CardDescription>
                      Define a named filtered data source based on an existing base table.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {get_FilterMapCard_Mode === "add" && renderFilterMapCardAddMode()}
                    {get_FilterMapCard_Mode === "edit" && renderFilterMapCardEditMode()}
                    {get_FilterMapCard_Mode === "manage" && renderFilterMapCardManageMode()}
                  </CardContent>
                </Card>

 

 {/* Section Map Card */}
                {get_SectionMapCard_BaseTablesOptions.length > 0 && (
                  <Card>
                    <CardHeader>
                      <Styled_CardHeader>Section Map</Styled_CardHeader>
                      <CardDescription>Construct your JSON Payload Section.</CardDescription>

                      {/* Tabs */}
                      <Tabs
                        value={get_SectionMapCard_Mode}
                        onValueChange={(v) => set_SectionMapCard_Mode(v as "add" | "edit" | "manage")}
                        className="mt-2"
                      >
                        <TabsList>
                          <TabsTrigger value="add">Add</TabsTrigger>
                          <TabsTrigger value="edit">Edit</TabsTrigger>
                          <TabsTrigger value="manage">Manage</TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {sectionMapCardMode({
                        mode: get_SectionMapCard_Mode,
                        constructedMap: get_SectionMapCard_ConstructedMap,
                        alias: get_SectionMapCard_SectionAilias,
                        setAlias: set_SectionMapCard_SectionAilias,
                        selectedEditAlias: get_SectionMapCard_SelectedEditAlias,
                        setSelectedEditAlias: set_SectionMapCard_SelectedEditAlias,
                        modTags: get_SectionMapCard_ModTags,
                      })}
                    </CardContent>


                  </Card>
                )}

{/* nestedMappingKey Card */}

                  <Card>
                    <CardHeader>
                      <Styled_CardHeader>Nested Map</Styled_CardHeader>
                        <div className="mt-2 flex justify-center">
                        <CardDescription>Construct your nestedMappingKey.</CardDescription>
                        </div>

                {/* Tabs */}
                        <div className="mt-2 flex justify-center">
                        <Tabs
                          value={get_NestedMapCard_Mode}
                          onValueChange={(v) => set_NestedMapCard_Mode(v as "add" | "edit" | "manage")}
                          className="mt-2"
                        >
                          <TabsList>
                            <TabsTrigger value="add">Add</TabsTrigger>
                            <TabsTrigger value="edit">Edit</TabsTrigger>
                            <TabsTrigger value="manage">Manage</TabsTrigger>
                          </TabsList>
                        </Tabs>
                      </div>
                    </CardHeader>
                          
                {/*CardContent*/}
                {nestedMapCardMode()}
              </Card>

 {/* Batching Map Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>Batching Map</CardTitle>
                    <CardDescription>
                      Configure how Prep JSON computes <code>batchData</code> for your assistant payload.
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Mode */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                      <div className="md:col-span-1">
                        <Label>Mode</Label>
                        <Select value={bm_mode} onValueChange={(v) => onChange_Mode(v as BatchingMode)}>
                          <SelectTrigger><SelectValue placeholder="Select mode" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="noBatching">No batching</SelectItem>
                            <SelectItem value="outputControlled">Output-controlled</SelectItem>
                            <SelectItem value="dataDriven">Data-driven</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Alias helper (UI-only) */}
                      {(bm_mode === "outputControlled" || bm_mode === "dataDriven") && (
                        <div className="md:col-span-1">
                          <Label>What are you batching? (alias)</Label>
                          <Input
                            placeholder="e.g., chapters, characters, episodes"
                            value={aliasInput}
                            onChange={(e) => onChange_Alias(e.target.value)}
                          />
                        </div>
                      )}

                      {/* Per-batch default */}
                      {(bm_mode === "outputControlled" || bm_mode === "dataDriven") && (
                        <div className="md:col-span-1">
                          <Label>Per-batch count</Label>
                          <Input
                            type="number"
                            min={1}
                            placeholder="e.g., 5"
                            value={bm_perBatchDefault}
                            onChange={(e) => onChange_PerBatchDefault(e.target.value)}
                          />
                        </div>
                      )}
                    </div>

                    {/* Data-driven specifics */}
                    {bm_mode === "dataDriven" && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <Label>Source (globalThis)</Label>
                          <Select value={bm_source} onValueChange={onChange_Source}>
                            <SelectTrigger><SelectValue placeholder="Select source" /></SelectTrigger>
                            <SelectContent>
                                {get_SourceSelections?.map((key) => (
                                  <SelectItem key={key} value={key}>
                                    {key}
                                  </SelectItem>
                                ))}
                              </SelectContent>


                          </Select>
                          <p className="text-xs text-muted-foreground mt-1">
                            Must match a dataset your Prep JSON hoists to <code>globalThis[source]</code>.
                          </p>
                        </div>

                        <div>
                          <Label>Total key</Label>
                          <Input
                            placeholder="e.g., totalChapters"
                            value={bm_totalKey}
                            onChange={(e) => onChange_TotalKey(e.target.value)}
                          />
                        </div>

                        <div>
                          <Label>Per-batch key</Label>
                          <Input
                            placeholder="e.g., chaptersPerBatch"
                            value={bm_perBatchKey}
                            onChange={(e) => onChange_PerBatchKey(e.target.value)}
                          />
                        </div>
                      </div>
                    )}

                    {/* Output-controlled specifics */}
                    {bm_mode === "outputControlled" && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="md:col-span-1">
                          <Label>Per-batch key</Label>
                          <Input
                            placeholder="e.g., chaptersPerBatch"
                            value={bm_perBatchKey}
                            onChange={(e) => onChange_PerBatchKey(e.target.value)}
                          />
                        </div>
                      </div>
                    )}

                    {/* Errors */}
                    {bm_errors.length > 0 && (
                      <div className="rounded-md border border-destructive/20 bg-destructive/5 p-3">
                        <ul className="list-disc list-inside text-sm text-destructive">
                          {bm_errors.map((err, idx) => <li key={idx}>{err}</li>)}
                        </ul>
                      </div>
                    )}

                    {/* Live JSON Preview */}
                    <div className="rounded-md border p-3 bg-muted/40">
                      <Label className="mb-1 block">batchingMap (preview)</Label>
                      <pre className="text-xs whitespace-pre-wrap">
                        {JSON.stringify(get_BatchingMapCard_ConstructedMap ?? { /* empty until valid */ }, null, 2)}
                      </pre>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button type="button" variant="secondary" onClick={clear_BatchingMapCard}>
                        Clear
                      </Button>
                      {/* Save button optional; map is already emitted live via state */}
                    </div>
                  </CardContent>
                </Card>



  {/* Generate Payload Map Card*/}
                {get_BaseTableCard_SelectedTables.length > 0 && (
                <Card>
                    <CardContent className="space-y-4">
                    <div className="p-4 space-y-4">
                        <Styled_CardHeader>Payload Preview</Styled_CardHeader>
                        <Label className="font-bold mt-4">Enter The Narrative Project ID for this test:</Label>
                        <Input 
                              placeholder="narrative_project_id"
                              value={get_PayloadPreviewCard_NarrativeProjectID}
                              onChange={(e) => set_PayloadPreviewCard_NarrativeProjectID (e.target.value)}
                          />
                        {get_PayloadPreviewCard_PreviewText ? (
                        <AutoResizeTextarea
                          className="bg-muted p-4 rounded text-xs overflow-auto max-h-[1600px]"
                          value={
                            get_PayloadPreviewCard_PreviewText
                              ? JSON.stringify(get_PayloadPreviewCard_PreviewText, null, 2)
                              : "// Map preview will appear here after generation"
                          }
                          readOnly
                        />


                        ) : (
                        <p>Payload preview will appear here after generation...</p>
                        )}
                    </div>
                    <Button onClick={handleGeneratePayload}>Generate Payload</Button>
                    </CardContent>
                </Card>
                )}

      {/* Clear view button */}
                <Button
                variant="destructive"
                onClick={handleClearView}
              >
                Clear Form
              </Button>

                </div>
            </div>

{/* RIGHT – Persistent Preview */}
            <div className="w-1/3 min-w-[250px] sticky top-4 self-start">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    {/* Left: title (allow truncation) */}
                    <div className="min-w-0">
                      <Styled_CardHeader className="truncate">Field Map Library</Styled_CardHeader>
                    </div>

                    {/* Right: actions */}
                    <div className="ml-4 flex items-center gap-2 flex-nowrap shrink-0">
                      <Button size="icon" variant="ghost" onClick={() => setImportOpen(true)} title="Import / Hydrate JSON">
                        <FileUp className="h-4 w-4" />
                      </Button>
                      {renderImportPayloadDialog()}
                      <Button size="icon" variant="ghost" onClick={copyLibraryToClipboard} title="Copy JSON" disabled={!get_FieldMapPreview_Results}>
                        {libraryCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </CardHeader>



                  <CardContent>
                    <Textarea
                      readOnly
                      value={JSON.stringify(get_FieldMapPreview_Results ?? {}, null, 2)}
                      className="font-mono bg-muted"
                      rows={Math.max(6, JSON.stringify(get_FieldMapPreview_Results ?? {}, null, 2).split("\n").length)}
                    />
                  </CardContent>
                </Card>
            </div>
        </div>

    );


    //*********** */
    // Filter Map Card tab variations
    //*********** */
    function renderFilterMapCardAddMode() {
      const draftPreviewObj = buildFilterMapDraftSync(
        get_FilterMapCard_OutputAlias,
        get_FilterMapCard_SelectedDataSource,
        get_FilterMapCard_ConstructedFilters
      );
      const prettyDraft = draftPreviewObj ? JSON.stringify(draftPreviewObj, null, 2) : "";

      return (
        <>
          {/* Output Alias */}
          <div>
            <Label>Output Alias</Label>
            <Input
              value={get_FilterMapCard_OutputAlias}
              onChange={(e) => set_FilterMapCard_OutputAlias(e.target.value)}
              placeholder="e.g., filteredChapters"
              className="w-full"
            />
          </div>

          {/* Source Table Dropdown */}
          <div>
            <Label>Source Table</Label>
            <Select
              value={get_FilterMapCard_SelectedDataSource}
              onValueChange={set_FilterMapCard_SelectedDataSource}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select source (base alias or filter target)" />
              </SelectTrigger>
              <SelectContent>
                {get_SourceSelections?.map((key) => (
                  <SelectItem key={key} value={key}>
                    {key}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filter Rules */}
          <div className="space-y-3">
            <Label>Filter Rules</Label>

            {get_FilterMapCard_ConstructedFilters.map((filter, index) => (
              <div key={index} className="space-y-2">
                {/* Row 1: Delete + Field + Operator */}
                <div className="grid grid-cols-12 gap-3 items-center">
                  {/* Delete (icon before Field) */}
                  <div className="col-span-2 sm:col-span-1 flex">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => removeFilter(index)}
                      type="button"
                      aria-label="Remove"
                      title="Remove"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Field */}
                  <div className="col-span-10 sm:col-span-7 md:col-span-8 min-w-0">
                    <Select
                      value={filter.field}
                      onValueChange={(v) => updateFilter(index, "field", v)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Field" />
                      </SelectTrigger>
                      <SelectContent>
                        {(get_FilterMapCard_FieldMap[get_FilterMapCard_SelectedDataSource] || []).map(
                          (f) => (
                            <SelectItem key={f} value={f}>
                              {f}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Operator (locked in reference mode) */}
                  <div className="col-span-12 sm:col-span-4 md:col-span-3">
                    <Select
                      value={filter.operator}
                      onValueChange={(v) => updateFilter(index, "operator", v)}
                      disabled={filter.matchMode === "reference"}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Operator" />
                      </SelectTrigger>
                      <SelectContent>
                        {["=", "in", "!=", "like"].map((op) => (
                          <SelectItem key={op} value={op}>
                            {op}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {filter.matchMode === "reference" && (
                      <p className="text-xs text-muted-foreground mt-1">Locked to “=” for references</p>
                    )}
                  </div>
                </div>

                {/* Row 2: Mode switch + Value/Reference UI (under Field/Operator) */}
                <div className="grid grid-cols-12 gap-3 items-start">
                  {/* spacer under the trash icon column */}
                  <div className="col-span-2 sm:col-span-1" />

                  <div className="col-span-10 sm:col-span-11 min-w-0">
                    {/* Match type switch (Tabs) */}
                    <div className="mb-2">
                      <Tabs
                        value={filter.matchMode ?? "value"}
                        onValueChange={(v) => setFilterMatchMode(index, v as "value" | "reference")}
                        className="w-full"
                      >
                        <TabsList className="grid grid-cols-2 w-full">
                          <TabsTrigger value="value" className="h-8 text-xs whitespace-nowrap">
                            Value
                          </TabsTrigger>
                          <TabsTrigger value="reference" className="h-8 text-xs whitespace-nowrap">
                            Reference
                          </TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </div>

                    {/* Match UI */}
                    {filter.matchMode === "reference" ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {/* Reference Source */}
                        <Select
                          value={filter.refSource ?? ""}
                          onValueChange={(v) => setFilterRefSource(index, v)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Reference Source" />
                          </SelectTrigger>
                          <SelectContent>
                            {get_SourceSelections?.map((key) => (
                              <SelectItem key={key} value={key}>
                                {key}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        {/* Reference Field */}
                        <Select
                          value={filter.refField ?? ""}
                          onValueChange={(v) => setFilterRefField(index, v)}
                          disabled={!filter.refSource}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Reference Field" />
                          </SelectTrigger>
                          <SelectContent>
                            {(filter.refSource
                              ? get_FilterMapCard_FieldMap[filter.refSource] || []
                              : []
                            ).map((f) => (
                              <SelectItem key={f} value={f}>
                                {f}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ) : (
                      <Input
                        placeholder="Match value (or JSON)"
                        value={filter.matchTo}
                        onChange={(e) => updateFilter(index, "matchTo", e.target.value)}
                        className="w-full"
                      />
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Actions */}
            <div className="flex justify-end gap-4 flex-wrap">
              <Button onClick={addFilter} type="button">
                + Add Filter Rule
              </Button>
              <Button onClick={handleAddFilterToPayloadMap} type="button">
                Push to Payload Map
              </Button>
            </div>
          </div>

          {/* Filter Output Preview */}
          <div>
            <Label>Generated Map Entry</Label>
            <Textarea
              readOnly
              value={prettyDraft}
              className="font-mono bg-muted w-full max-w-full whitespace-pre-wrap break-words resize-y"
              rows={Math.max(6, (prettyDraft || "").split("\n").length)}
            />
          </div>
        </>
      );
    }



    function renderFilterMapCardEditMode() {
      const availableAliases = Object.keys(get_FilterMapCard_ConstructedFilterMap || {});
      const aliasSelected = !!get_FilterMapCard_SelectedEditAlias;
      const editDisabled = !aliasSelected;

      const draftPreviewObj = buildFilterMapDraftSync(
        get_FilterMapCard_OutputAlias,
        get_FilterMapCard_SelectedDataSource,
        get_FilterMapCard_ConstructedFilters
      );
      const prettyDraft = draftPreviewObj ? JSON.stringify(draftPreviewObj, null, 2) : "";

      return (
        <>
          {/* Alias row (Edit) */}
          <div>
            <Label>Output Alias</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* Alias selector */}
              <Select
                value={get_FilterMapCard_SelectedEditAlias}
                onValueChange={set_FilterMapCard_SelectedEditAlias}
                disabled={availableAliases.length === 0}
              >
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={availableAliases.length ? "Select alias to edit" : "No aliases yet"}
                  />
                </SelectTrigger>
                <SelectContent>
                  {availableAliases.map((a) => (
                    <SelectItem key={a} value={a}>
                      {a}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Read-only alias mirror */}
              <Input
                readOnly
                value={get_FilterMapCard_SelectedEditAlias}
                placeholder="Selected alias"
                className="w-full"
              />
            </div>
          </div>

          {/* Hint until an alias is chosen */}
          {!aliasSelected && (
            <p className="text-sm text-muted-foreground">Select an alias to load its filters.</p>
          )}

          {/* Shared form, disabled until alias is selected */}
          <fieldset disabled={editDisabled} className="space-y-4">
            {/* Source Table Dropdown */}
            <div>
              <Label>Source Table</Label>
              <Select
                value={get_FilterMapCard_SelectedDataSource}
                onValueChange={set_FilterMapCard_SelectedDataSource}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select source (base alias or filter target)" />
                </SelectTrigger>
                <SelectContent>
                  {get_SourceSelections?.map((key) => (
                    <SelectItem key={key} value={key}>
                      {key}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filter Rules */}
            <div className="space-y-3">
              <Label>Filter Rules</Label>

              {get_FilterMapCard_ConstructedFilters.map((filter, index) => (
                <div key={index} className="space-y-2">
                  {/* Row 1: Delete + Field + Operator */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                    {/* Delete (icon before Field) */}
                    <div className="sm:col-span-1 flex">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => removeFilter(index)}
                        type="button"
                        aria-label="Remove"
                        title="Remove"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Field */}
                    <div className="min-w-0 sm:col-span-7 md:col-span-8">
                      <Select
                        value={filter.field}
                        onValueChange={(v) => updateFilter(index, "field", v)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Field" />
                        </SelectTrigger>
                        <SelectContent>
                          {(get_FilterMapCard_FieldMap[get_FilterMapCard_SelectedDataSource] || []).map(
                            (f) => (
                              <SelectItem key={f} value={f}>
                                {f}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Operator (locked in reference mode) */}
                    <div className="sm:col-span-4 md:col-span-3">
                      <Select
                        value={filter.operator}
                        onValueChange={(v) => updateFilter(index, "operator", v)}
                        disabled={filter.matchMode === "reference"}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Operator" />
                        </SelectTrigger>
                        <SelectContent>
                          {["=", "in", "!=", "like"].map((op) => (
                            <SelectItem key={op} value={op}>
                              {op}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {filter.matchMode === "reference" && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Locked to “=” for references
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Row 2: Mode switch + Value/Reference UI (under Field/Operator) */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-start">
                    {/* spacer under the trash icon column (sm+) */}
                    <div className="hidden sm:block sm:col-span-1" />

                    <div className="min-w-0 sm:col-span-11">
                      {/* Match type switch (Tabs) – responsive width */}
                      <div className="mb-2">
                        <Tabs
                          value={filter.matchMode ?? "value"}
                          onValueChange={(v) => setFilterMatchMode(index, v as "value" | "reference")}
                          className="w-full sm:max-w-sm"
                        >
                          <TabsList className="grid grid-cols-2 w-full">
                            <TabsTrigger value="value" className="h-8 text-xs whitespace-nowrap">
                              Value
                            </TabsTrigger>
                            <TabsTrigger value="reference" className="h-8 text-xs whitespace-nowrap">
                              Reference
                            </TabsTrigger>
                          </TabsList>
                        </Tabs>
                      </div>

                      {/* Match UI */}
                      {filter.matchMode === "reference" ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {/* Reference Source */}
                          <Select
                            value={filter.refSource ?? ""}
                            onValueChange={(v) => setFilterRefSource(index, v)}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Reference Source" />
                            </SelectTrigger>
                            <SelectContent>
                              {get_SourceSelections?.map((key) => (
                                <SelectItem key={key} value={key}>
                                  {key}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          {/* Reference Field */}
                          <Select
                            value={filter.refField ?? ""}
                            onValueChange={(v) => setFilterRefField(index, v)}
                            disabled={!filter.refSource}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Reference Field" />
                            </SelectTrigger>
                            <SelectContent>
                              {(filter.refSource
                                ? get_FilterMapCard_FieldMap[filter.refSource] || []
                                : []
                              ).map((f) => (
                                <SelectItem key={f} value={f}>
                                  {f}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      ) : (
                        <Input
                          placeholder="Match value (or JSON)"
                          value={filter.matchTo}
                          onChange={(e) => updateFilter(index, "matchTo", e.target.value)}
                          className="w-full"
                        />
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Actions */}
              <div className="flex justify-end gap-4 flex-wrap">
                <Button onClick={addFilter} type="button">
                  + Add Filter Rule
                </Button>
                <Button onClick={handleAddFilterToPayloadMap} type="button">
                  Push to Payload Map
                </Button>
              </div>
            </div>

            {/* Filter Output Preview */}
            <div>
              <Label>Generated Map Entry</Label>
              <Textarea
                readOnly
                value={prettyDraft}
                className="font-mono bg-muted w-full max-w-full whitespace-pre-wrap break-words resize-y"
                rows={Math.max(6, (prettyDraft || "").split("\n").length)}
              />
            </div>
          </fieldset>
        </>
      );
    }


    function renderFilterMapCardManageMode() {
      return (
        <div className="space-y-3 mt-4">
          <Label className="mb-1 block">Filter Maps (in order)</Label>

          {get_FilterMapCard_FilterOrder.length === 0 ? (
            <p className="text-sm text-muted-foreground">No filter maps yet.</p>
          ) : (
            get_FilterMapCard_FilterOrder.map((alias, i) => {
              const entry = get_FilterMapCard_ConstructedFilterMap?.[alias] ?? {};
              const source = entry?.sourceKey ?? entry?.source ?? "(unknown)";
              const target = entry?.target ?? "(no target)";
              const steps =
                Array.isArray(entry?.steps) ? entry.steps :
                Array.isArray(entry?.filters) ? entry.filters : [];
              const stepCount = steps.length;

              const isRenaming = get_FilterMapCard_RenamingAlias === alias;
              const atTop = i === 0;
              const atBottom = i === get_FilterMapCard_FilterOrder.length - 1;

              return (
                <div
                  key={alias}
                  className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 border rounded p-2 overflow-hidden"
                >
                  {/* Left: meta / rename */}
                  <div className="flex-1 min-w-0">
                    {!isRenaming ? (
                      <>
                        <div className="font-medium truncate">{alias}</div>
                        <div className="text-xs md:text-sm text-muted-foreground truncate">
                          Source: {source} • Target: {target} • Rules: {stepCount}
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Input
                          value={get_FilterMapCard_RenameInput}
                          onChange={(e) => set_FilterMapCard_RenameInput(e.target.value)}
                          placeholder="New filter alias"
                          className="w-full"
                        />
                        <Button size="icon" onClick={confirmRename} aria-label="Save rename" title="Save">
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="outline" onClick={cancelRename} aria-label="Cancel rename" title="Cancel">
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Right: actions (wrap under on narrow widths) */}
                  {!isRenaming && (
                    <div className="flex items-center gap-1 flex-wrap md:flex-nowrap justify-end md:justify-start shrink-0">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => moveAlias(alias, "up")}
                        disabled={atTop}
                        aria-label="Move up"
                        title="Move up"
                      >
                        <SquareArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => moveAlias(alias, "down")}
                        disabled={atBottom}
                        aria-label="Move down"
                        title="Move down"
                      >
                        <SquareArrowDown className="h-4 w-4" />
                      </Button>

                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => beginRename(alias)}
                        aria-label="Rename"
                        title="Rename"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>

                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          set_FilterMapCard_Mode("edit");
                          set_FilterMapCard_SelectedEditAlias(alias);
                        }}
                        aria-label="Edit"
                        title="Edit"
                      >
                        <FileCog className="h-4 w-4" />
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            title="Delete"
                            aria-label="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete “{alias}”?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This removes the filter map and its ordering. References to this alias are not updated.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteAlias(alias)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      );
    }









    /**** */
    // sectionMapCardMode handles the tab toggle to display different cards in Section Map Card based on tab selection
    /**** */

    function sectionMapCardMode({
      mode,
      constructedMap,           // not used yet in Add; keep for Edit later
      alias,
      setAlias,
      selectedEditAlias,
      setSelectedEditAlias,
      modTags,
    }: {
      mode: "add" | "edit" | "manage";
      constructedMap: Record<string, any>;
      alias: string;
      setAlias: (v: string) => void;
      selectedEditAlias: string;
      setSelectedEditAlias: (v: string) => void;
      modTags: ModTag[];
    }) {
      if (mode === "add") {
        // === your original, working Add UI ===
        return (
          <div className="flex flex-col space-y-2">
            <Label>Section Name:</Label>
            <Input
              placeholder="Section Name"
              value={get_SectionMapCard_SectionAilias}
              onChange={(e) => set_SectionMapCard_SectionAilias(e.target.value)}
            />

            <Label>Choose the sections source data:</Label>
            <Select
              value={get_SectionMapCard_SelectedSource}
              onValueChange={set_SectionMapCard_SelectedSource}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a source" />
              </SelectTrigger>
              <SelectContent>
                {get_SourceSelections.map((name) => (
                  <SelectItem key={name} value={name}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* switch for is conditional */}
            <div className="flex gap-2">
              <Label>Conditional Inclusion?</Label>
              <Switch
                checked={get_SectionMapCard_ConditionalSwitch}
                onCheckedChange={(value) => set_SectionMapCard_ConditionalSwitch(value)}
              >
                Conditional
              </Switch>
            </div>

            {/* If conditional display select to choose mod tag */}
            {get_SectionMapCard_ConditionalSwitch && (
              <div className="mt-3">
                <Label className="mb-1 block">Required tag</Label>
                <Select
                  value={get_SectionMapCard_ConditionValue}
                  onValueChange={set_SectionMapCard_ConditionValue}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose a tag…" />
                  </SelectTrigger>
                  <SelectContent>
                    {(modTags ?? []).map((t) => (
                      <SelectItem key={t.mod_tag} value={t.mod_tag}>
                        {t.mod_tag}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            
            {/* — Field list container with sticky header — */}
              <div className="mt-3 rounded border">
                {/* Header */}
                <div className="grid grid-cols-[auto,12rem,1fr,12rem] gap-3 items-center px-3 py-2 bg-muted/40 sticky top-0 z-10">
                  <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Use</div>
                  <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Source Field</div>
                  <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Alias (JSON key)</div>
                  <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Field Type</div>
                </div>

                {/* Scrollable rows */}
                <div className="max-h-80 overflow-auto">
                  {(get_SectionMapCard_FieldMap?.[get_SectionMapCard_SelectedSource] ?? [])
                    .slice()
                    .sort()
                    .map((fieldName) => {
                      const selected = get_SectionMapCard_SelectedFields.find(e => e.field === fieldName);
                      const value = selected?.alias ?? fieldName;

                      return (
                        <div
                          key={fieldName}
                          className="grid grid-cols-[auto,12rem,1fr,12rem] gap-3 items-center px-3 py-2 border-t"
                        >
                          {/* Use (checkbox) */}
                          <input
                            type="checkbox"
                            checked={Boolean(selected)}
                            onChange={() => toggleSectionField(fieldName)}
                            className="accent-primary"
                            aria-label={`Include ${fieldName}`}
                          />

                          {/* Source Field (name) */}
                          <span className="truncate">{fieldName}</span>

                          {/* Alias (only when selected; otherwise a subtle placeholder keeps columns aligned) */}
                          {selected ? (
                            <input
                              type="text"
                              className="border rounded px-2 py-1 w-full"
                              placeholder={fieldName}
                              value={value}
                              onChange={(e) => setSectionFieldAlias(fieldName, e.target.value)}
                            />
                          ) : (
                            <span className="text-muted-foreground text-sm italic">—</span>
                          )}

                          {/* Field Type (only when selected; otherwise empty cell to keep grid alignment) */}
                          {selected ? (
                            <Select
                              value={(selected.fieldType as SectionMapCard_FieldType) ?? "text"}
                              onValueChange={(v) => setSectionFieldType(fieldName, v as SectionMapCard_FieldType)}
                            >
                              <SelectTrigger><SelectValue placeholder="text" /></SelectTrigger>
                              <SelectContent>
                                {SectionMapCard_FIELD_TYPES.map(t => (
                                  <SelectItem key={t} value={t}>{t}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <span />
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>



            <Button onClick={handleAddSectionMap}>Add Section Map</Button>
          </div>
        );
      }

      // === Edit placeholder for now; we’ll wire it next ===
      if (mode === "edit") {
  const aliases = Object.keys(get_SectionMapCard_ConstructedMap ?? {});
  return (
    <div className="space-y-3">
      <Label>Select Section to Edit:</Label>
      <Select
        value={get_SectionMapCard_SelectedEditAlias}
        onValueChange={handleSelectEditAlias}
      >
        <SelectTrigger>
          <SelectValue placeholder="Choose a section" />
        </SelectTrigger>
        <SelectContent>
          {aliases.map((a) => (
            <SelectItem key={a} value={a}>{a}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {get_SectionMapCard_SelectedEditAlias && (
        <>
          <Label className="mt-4 block">Section Name:</Label>
          <Input
            value={get_SectionMapCard_SectionAilias}
            onChange={(e) => set_SectionMapCard_SectionAilias(e.target.value)}
          />

          <Label className="mt-3">Choose the section’s source data:</Label>
          <Select
            value={get_SectionMapCard_SelectedSource}
            onValueChange={set_SectionMapCard_SelectedSource}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose a source" />
            </SelectTrigger>
            <SelectContent>
              {get_SourceSelections.map((name) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2 mt-3">
            <Label>Conditional Inclusion?</Label>
            <Switch
              checked={get_SectionMapCard_ConditionalSwitch}
              onCheckedChange={set_SectionMapCard_ConditionalSwitch}
            />
          </div>

          {/* If conditional display select to choose mod tag */}
            {get_SectionMapCard_ConditionalSwitch && (
              <div className="mt-3">
                <Label className="mb-1 block">Required tag</Label>
                <Select
                  value={get_SectionMapCard_ConditionValue}
                  onValueChange={set_SectionMapCard_ConditionValue}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose a tag…" />
                  </SelectTrigger>
                  <SelectContent>
                    {(modTags ?? []).map((t) => (
                      <SelectItem key={t.mod_tag} value={t.mod_tag}>
                        {t.mod_tag}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

          {/* Header */}
          <div className="grid grid-cols-[auto,12rem,1fr,12rem] gap-3 items-center px-3 py-2 bg-muted/40 sticky top-0 z-10 mt-3 rounded-t border-x border-t">
            <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Use</div>
            <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Source Field</div>
            <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Alias (JSON key)</div>
            <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Field Type</div>
          </div>

          {/* Scrollable rows */}
          <div className="max-h-80 overflow-auto border-x border-b rounded-b">
            {(get_SectionMapCard_FieldMap?.[get_SectionMapCard_SelectedSource] ?? [])
              .slice()
              .sort()
              .map((fieldName) => {
                const selected = get_SectionMapCard_SelectedFields.find(e => e.field === fieldName);
                const value = selected?.alias ?? fieldName;

                return (
                  <div
                    key={fieldName}
                    className="grid grid-cols-[auto,12rem,1fr,12rem] gap-3 items-center px-3 py-2 border-t first:border-t-0"
                  >
                    {/* Use (checkbox) */}
                    <input
                      type="checkbox"
                      checked={Boolean(selected)}
                      onChange={() => toggleSectionField(fieldName)}
                      className="accent-primary"
                      aria-label={`Include ${fieldName}`}
                    />

                    {/* Source Field (name) */}
                    <span className="truncate">{fieldName}</span>

                    {/* Alias + Field Type if selected; placeholders if not */}
                    {selected ? (
                      <>
                        {/* Alias */}
                        <input
                          type="text"
                          className="border rounded px-2 py-1 w-full"
                          placeholder={fieldName}
                          value={value}
                          onChange={(e) => setSectionFieldAlias(fieldName, e.target.value)}
                        />

                        {/* Field Type */}
                        <Select
                          value={(selected.fieldType as SectionMapCard_FieldType) ?? "text"}
                          onValueChange={(v) => setSectionFieldType(fieldName, v as SectionMapCard_FieldType)}
                        >
                          <SelectTrigger><SelectValue placeholder="text" /></SelectTrigger>
                          <SelectContent>
                            {SectionMapCard_FIELD_TYPES.map(t => (
                              <SelectItem key={t} value={t}>{t}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </>
                    ) : (
                      <>
                        <span className="text-muted-foreground text-sm italic">—</span>
                        <span />
                      </>
                    )}
                  </div>
                );
              })}
          </div>

          <Button
            className="mt-4"
            onClick={() => handleUpdateSectionMap(get_SectionMapCard_SelectedEditAlias)}
            disabled={
              !get_SectionMapCard_SelectedEditAlias ||
              !get_SectionMapCard_SectionAilias.trim() ||
              !get_SectionMapCard_SelectedSource ||
              get_SectionMapCard_SelectedFields.length === 0
            }
          >
            Update Section Map
          </Button>
        </>
      )}
    </div>
  );
}


      if (mode === "manage") {
        return (
              <div className="space-y-3 mt-4">
                {get_SectionMapCard_SectionOrder.length === 0 ? (
                  <div className="text-sm text-muted-foreground">No sections yet.</div>
                ) : (
                  get_SectionMapCard_SectionOrder.map((alias, idx) => {
                    const fieldsObj = get_SectionMapCard_ConstructedMap?.[alias] ?? {};
                    const fieldCount = Object.keys(fieldsObj).length;
                    const meta = get_SectionMapCard_ConstructedJsonOutputMap?.[alias] ?? {};
                    const source = meta?.source ?? "(unknown)";
                    const conditional = Boolean(meta?.conditional);
                    const isRenaming = get_SectionMapCard_RenamingAlias === alias;

                    const atTop = idx === 0;
                    const atBottom = idx === get_SectionMapCard_SectionOrder.length - 1;

                    return (
                      <div key={alias} className="flex items-center gap-3 border rounded p-2">
                        <div className="flex-1 min-w-0">
                          {!isRenaming ? (
                            <>
                              <div className="font-medium truncate">{alias}</div>
                              <div className="text-sm text-muted-foreground truncate">
                                Source: {source} • Fields: {fieldCount}
                                {conditional ? " • Conditional" : ""}
                              </div>
                            </>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Input
                                value={get_SectionMapCard_RenameInput}
                                onChange={(e) => set_SectionMapCard_RenameInput(e.target.value)}
                                placeholder="New section alias"
                              />
                              <Button size="icon" onClick={commitSectionRename} aria-label="Save rename" title="Save">
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button size="icon" variant="outline" onClick={cancelSectionRename} aria-label="Cancel rename" title="Cancel">
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>

                        {!isRenaming && (
                          <div className="flex items-center gap-1 shrink-0">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => moveSectionUp(alias)}
                              disabled={atTop}
                              aria-label="Move up"
                              title="Move up"
                            >
                              <SquareArrowUp className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => moveSectionDown(alias)}
                              disabled={atBottom}
                              aria-label="Move down"
                              title="Move down"
                            >
                              <SquareArrowDown className="h-4 w-4" />
                            </Button>

                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => beginSectionRename(alias)}
                              aria-label="Rename"
                              title="Rename"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>

                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => { set_SectionMapCard_Mode("edit"); handleSelectEditAlias(alias); }}
                              aria-label="Edit"
                              title="Edit"
                            >
                              <FileCog className="h-4 w-4" />
                            </Button>

                            {/* Optional: duplicate */}
                            {/* <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => duplicateSection(alias)}
                              aria-label="Duplicate"
                              title="Duplicate"
                            >
                              <Copy className="h-4 w-4" />
                            </Button> */}

                            <Button
                              size="icon"
                              variant="destructive"
                              onClick={() => deleteSection(alias)}
                              aria-label="Delete"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            );
      }
    } // END OF HELPER FUNCTION sectionMapCardMode


    /**** */
    // nestedMapCardMode handles the tab toggle to display different cards in Nested Map Card based on tab selection
    /**** */
    function nestedMapCardMode(){
      if(get_NestedMapCard_Mode === "add"){
        return(
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Alias (placeholder select for now) */}
            <div>
              <Label>Alias (must match a nested field)</Label>
              <Select
                  value={
                    get_NestedMapCard_SelectedAlias
                      ? `${get_NestedMapCard_SelectedAlias.section}::${get_NestedMapCard_SelectedAlias.field}`
                      : undefined // ← not ""
                  }
                  onValueChange={(v) => {
                    const [section, field] = v.split("::");
                    set_NestedMapCard_SelectedAlias({ section, field });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose alias" />
                  </SelectTrigger>
                  <SelectContent>
                    {get_NestedMapCard_AliasOptions.length > 0 ? (
                      get_NestedMapCard_AliasOptions.map((opt) => {
                        const key = `${opt.section}::${opt.field}`;
                        return (
                          <SelectItem key={key} value={key}>
                            {opt.section} · {opt.field}
                          </SelectItem>
                        );
                      })
                    ) : (
                      // Don't use <SelectItem value="">…</SelectItem>
                      <div className="px-2 py-1.5 text-sm text-muted-foreground">
                        No nested fields found
                      </div>
                    )}
                  </SelectContent>
                </Select>

              <p className="text-xs text-muted-foreground mt-1">
                Pulled from your Section Maps (fields with <code>fieldType: "nestedMapping"</code>).
              </p>

            </div>

            {/* recordSource (real options from get_SourceSelections) */}
            <div>
              <Label>recordSource</Label>
              <Select
                value={get_NestedMapCard_RecordSource || undefined} // ← not ""
                onValueChange={set_NestedMapCard_RecordSource}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a recordSource" />
                </SelectTrigger>
                <SelectContent>
                  {get_SourceSelections.length ? (
                    get_SourceSelections.map((name) => (
                      <SelectItem key={name} value={name}>{name}</SelectItem>
                    ))
                  ) : (
                    <div className="px-2 py-1.5 text-sm text-muted-foreground">No sources</div>
                  )}
                </SelectContent>
              </Select>

              <p className="text-xs text-muted-foreground mt-1">
                Populated from your base tables + filterMap SoT.
              </p>
            </div>

            {/* linkFieldInParent */}
            <div>
            <Label>linkFieldInParent</Label>
            <Select
              value={get_NestedMapCard_LinkFieldInParent || undefined} // Radix: use undefined, not ""
              onValueChange={set_NestedMapCard_LinkFieldInParent}
            >
              <SelectTrigger>
                <SelectValue placeholder={parentSourceAlias ? `Choose a field from ${parentSourceAlias}` : "Choose a parent first"} />
              </SelectTrigger>
              <SelectContent>
                {get_NestedMapCard_ParentFields.length ? (
                  get_NestedMapCard_ParentFields.map((f) => (
                    <SelectItem key={f} value={f}>{f}</SelectItem>
                  ))
                ) : (
                  <div className="px-2 py-1.5 text-sm text-muted-foreground">
                    {parentSourceAlias ? "No fields found" : "Select a nested alias to load parent fields"}
                  </div>
                )}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              Parent source: <code>{parentSourceAlias || "—"}</code>
            </p>
          </div>


            {/* childIDField */}
            <div>
              <Label>childIDField</Label>
              <Select
                value={get_NestedMapCard_ChildIDField || undefined}  // <-- undefined, not ""
                onValueChange={set_NestedMapCard_ChildIDField}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      get_NestedMapCard_RecordSource
                        ? `Choose a field from ${get_NestedMapCard_RecordSource}`
                        : "Select a recordSource first"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {get_NestedMapCard_ChildFields.length ? (
                    get_NestedMapCard_ChildFields.map(f => (
                      <SelectItem key={f} value={f}>{f}</SelectItem>
                    ))
                  ) : (
                    <div className="px-2 py-1.5 text-sm text-muted-foreground">
                      {get_NestedMapCard_RecordSource
                        ? "No fields found"
                        : "Select a recordSource to load fields"}
                    </div>
                  )}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Children come from <code>{get_NestedMapCard_RecordSource || "—"}</code>
              </p>
            </div>


            {/* fieldMappingKey (placeholder select for now) */}
      <div>
        <Label>fieldMappingKey</Label>
        <Select
          value={get_NestedMapCard_FieldMappingKey || undefined}   // use undefined, not ""
          onValueChange={set_NestedMapCard_FieldMappingKey}
        >
          <SelectTrigger>
            <SelectValue placeholder="Choose child section map" />
          </SelectTrigger>
          <SelectContent>
            {fieldMappingKeyOptions.length ? (
              fieldMappingKeyOptions.map((alias) => (
                <SelectItem key={alias} value={alias}>{alias}</SelectItem>
              ))
            ) : (
              <div className="px-2 py-1.5 text-sm text-muted-foreground">
                No section maps yet
              </div>
            )}
          </SelectContent>
        </Select>
      </div>


            {/* sortKey (placeholder select for now) */}
            <div>
        <Label>sortKey (optional)</Label>
        <Select
          value={get_NestedMapCard_SortKey ? get_NestedMapCard_SortKey : "__none__"}
          onValueChange={(v) => set_NestedMapCard_SortKey(v === "__none__" ? "" : v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Choose sort (optional)" />
          </SelectTrigger>
          <SelectContent>
            {/* No-sort option */}
            <SelectItem value="__none__">— No sort —</SelectItem>

            {/* Static options */}
            {NESTED_MAP_SORT_KEY_OPTIONS.map((k) => (
              <SelectItem key={k} value={k}>{k}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

          </div>

          {/* Preview area (purely visual for now) */}
          <div className="mt-2">
            <Label>Preview</Label>
            <pre>{JSON.stringify({
              [previewAlias]: {
                recordSource: get_NestedMapCard_RecordSource || "<recordSource>",
                linkFieldInParent: get_NestedMapCard_LinkFieldInParent || "<linkFieldInParent>",
                childIDField: get_NestedMapCard_ChildIDField || "ID",
                fieldMappingKey: get_NestedMapCard_FieldMappingKey || "<fieldMappingKey>",
                sortKey: get_NestedMapCard_SortKey || "<sortKey>",
              }
            }, null, 2)}</pre>

          </div>

          <div className="flex justify-end gap-2">
            <Button variant="ghost">Cancel</Button>
            <Button
              onClick={handleAddNestedMapping}
              disabled={
                !get_NestedMapCard_SelectedAlias ||
                !get_NestedMapCard_RecordSource ||
                !get_NestedMapCard_LinkFieldInParent ||
                !get_NestedMapCard_FieldMappingKey
              }
            >
              Add Nested Mapping
            </Button>


          </div>
        </CardContent>
        )
      }

      // inside nestedMapCardMode()
if (get_NestedMapCard_Mode === "edit") {
  return (
    <CardContent className="space-y-4">
    <>
      {/* Row 1: alias + recordSource (matches Add) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Select nested alias to edit</Label>
          <Select
            value={get_NestedMapCard_SelectedEditAlias || undefined}
            onValueChange={handleSelectEditNestedAlias}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose an existing nested alias" />
            </SelectTrigger>
            <SelectContent>
              {nestedExistingAliases.length ? (
                nestedExistingAliases.map((a) => (
                  <SelectItem key={a} value={a}>
                    {(() => {
                      const hit = get_NestedMapCard_AliasOptions.find(o => o.field === a);
                      return hit ? `${hit.section} · ${a}` : a; // optional: match Add's label style
                    })()}
                  </SelectItem>
                ))
              ) : (
                <div className="px-2 py-1.5 text-sm text-muted-foreground">
                  No nested mappings yet. Add one in the Add tab.
                </div>
              )}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>recordSource</Label>
          <Select
            value={get_NestedMapCard_RecordSource || undefined}
            onValueChange={set_NestedMapCard_RecordSource}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose a recordSource" />
            </SelectTrigger>
            <SelectContent>
              {get_SourceSelections.length ? (
                get_SourceSelections.map((name) => (
                  <SelectItem key={name} value={name}>{name}</SelectItem>
                ))
              ) : (
                <div className="px-2 py-1.5 text-sm text-muted-foreground">No sources</div>
              )}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-1">
            Populated from your base tables + filterMap SoT.
          </p>
        </div>
      </div>

      {/* Row 2: linkFieldInParent + childIDField */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>linkFieldInParent</Label>
          <Select
            value={get_NestedMapCard_LinkFieldInParent || undefined}
            onValueChange={set_NestedMapCard_LinkFieldInParent}
          >
            <SelectTrigger className="w-full">
              <SelectValue
                placeholder={
                  parentSourceAlias
                    ? `Choose a field from ${parentSourceAlias}`
                    : "Choose a parent first"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {get_NestedMapCard_ParentFields.length ? (
                get_NestedMapCard_ParentFields.map((f) => (
                  <SelectItem key={f} value={f}>{f}</SelectItem>
                ))
              ) : (
                <div className="px-2 py-1.5 text-sm text-muted-foreground">
                  {parentSourceAlias ? "No fields found" : "Select a nested alias to load parent fields"}
                </div>
              )}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-1">
            Parent source: <code>{parentSourceAlias || "—"}</code>
          </p>
        </div>

        <div>
          <Label>childIDField</Label>
          <Select
            value={get_NestedMapCard_ChildIDField || undefined}
            onValueChange={set_NestedMapCard_ChildIDField}
          >
            <SelectTrigger className="w-full">
              <SelectValue
                placeholder={
                  get_NestedMapCard_RecordSource
                    ? `Choose a field from ${get_NestedMapCard_RecordSource}`
                    : "Select a recordSource first"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {get_NestedMapCard_ChildFields.length ? (
                get_NestedMapCard_ChildFields.map((f) => (
                  <SelectItem key={f} value={f}>{f}</SelectItem>
                ))
              ) : (
                <div className="px-2 py-1.5 text-sm text-muted-foreground">
                  {get_NestedMapCard_RecordSource
                    ? "No fields found"
                    : "Select a recordSource to load fields"}
                </div>
              )}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-1">
            Children come from <code>{get_NestedMapCard_RecordSource || "—"}</code>
          </p>
        </div>
      </div>

      {/* Row 3: fieldMappingKey + sortKey */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>fieldMappingKey</Label>
          <Select
            value={get_NestedMapCard_FieldMappingKey || undefined}
            onValueChange={set_NestedMapCard_FieldMappingKey}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose child section map" />
            </SelectTrigger>
            <SelectContent>
              {fieldMappingKeyOptions.length ? (
                fieldMappingKeyOptions.map((alias) => (
                  <SelectItem key={alias} value={alias}>{alias}</SelectItem>
                ))
              ) : (
                <div className="px-2 py-1.5 text-sm text-muted-foreground">No section maps yet</div>
              )}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>sortKey (optional)</Label>
          <Select
            value={get_NestedMapCard_SortKey ? get_NestedMapCard_SortKey : "__none__"}
            onValueChange={(v) => set_NestedMapCard_SortKey(v === "__none__" ? "" : v)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose sort (optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">— No sort —</SelectItem>
              {NESTED_MAP_SORT_KEY_OPTIONS.map((k) => (
                <SelectItem key={k} value={k}>{k}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Preview */}
      <div className="mt-2">
        <Label>Preview</Label>
        <pre className="text-xs bg-muted p-3 rounded overflow-auto">
{JSON.stringify({
  [get_NestedMapCard_SelectedEditAlias || "<alias>"]: {
    recordSource: get_NestedMapCard_RecordSource || "<recordSource>",
    linkFieldInParent: get_NestedMapCard_LinkFieldInParent || "<linkFieldInParent>",
    childIDField: get_NestedMapCard_ChildIDField || "ID",
    fieldMappingKey: get_NestedMapCard_FieldMappingKey || "<fieldMappingKey>",
    sortKey: get_NestedMapCard_SortKey || "<sortKey>",
  }
}, null, 2)}
        </pre>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <Button variant="destructive" onClick={handleDeleteNestedMapping}>
          Delete
        </Button>
        <Button
          onClick={handleUpdateNestedMapping}
          disabled={
            !get_NestedMapCard_SelectedEditAlias ||
            !get_NestedMapCard_RecordSource ||
            !get_NestedMapCard_LinkFieldInParent ||
            !get_NestedMapCard_FieldMappingKey
          }
        >
          Update Nested Mapping
        </Button>
      </div>
    </>
    </CardContent>
  );
}



    }


    /**** */
    // Field Map Library add in helper jsx
    /**** */
    
    function renderImportPayloadDialog() {
      const EMPTY_PAYLOAD = JSON.stringify({ baseTableMap:{}, jsonOutputMap:{}, filterMap:{}, sectionMaps:{}, nestedMappingKey:{}, filterOrder:[] }, null, 2);
      return (
        <Dialog
            open={importOpen}
            onOpenChange={(open) => {
              setImportOpen(open);
              if (open) setImportText("");       // blank on open so placeholder appears
              else setImportText("");            // also clear on close
            }}
          >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Import payload (replace current)</DialogTitle>
              <DialogDescription>
                Choose a config and paste JSON exported from this tool.
              </DialogDescription>
            </DialogHeader>

            {/* Config dropdown (matches Base Table Selection style) */}
            <div className="space-y-1">
              <Label>Config Table</Label>
              <Select value={get_BaseTableCard_SelectedConfigTable} onValueChange={handleTableSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a config table" />
              </SelectTrigger>
              <SelectContent>
                {configBaseTables.map(({ label, tableName }) => (
                  <SelectItem key={tableName} value={tableName}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            </div>

            {/* JSON paste area */}
            <div className="space-y-1">
              <Label>Payload JSON</Label>
              <Textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                className="font-mono w-full h-64 whitespace-pre-wrap"
                placeholder={EMPTY_PAYLOAD}
              />
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setImportText("")}>
                Clear
              </Button>
              <Button onClick={handleImportReplace} disabled={!importText.trim() || !get_BaseTableCard_SelectedConfigTable}>
                Import & Replace
              </Button>

            </DialogFooter>
          </DialogContent>
        </Dialog>
      );
    }

} // END OF PayloadMapBuilderView

/*****************************************************************************************************
 * ***************************************** UTIL FUNCTIONS ******************************************
 * ***************************************************************************************************/

/**
 * Fetches all rows from the specified Supabase table.
 *
 * This function performs a `select("*")` query on the given table and returns all rows.
 * If the query fails, it logs the error and returns an empty array.
 *
 * @param {string} tableName - The name of the Supabase table to query.
 * @returns {Promise<any[]>} A promise that resolves to an array of table rows, or an empty array if an error occurs.
 *
 * @example
 * const rows = await selectAny("payload_base_tables");
 * console.log(rows);
 */
async function selectAny(tableName: string): Promise<any[]> {
  const { data, error } = await supabase.from(tableName).select("*");

  if (error) {
    console.error(`selectAny: Error loading table '${tableName}':`, error);
    return [];
  }

  return data || [];
} // END OF selectAny



/**
 * Builds a map of base tables for EF use.
 * Used in ef_step_assistant_PrepJSON when pulling in the base tables needed for building the payload JSON
 *
 * @param configTableRows - Raw config rows pulled from Supabase (e.g. payload_base_tables)
 * @param selectedTableNames - Array of `table_name` strings currently selected in the UI
 * @returns Map of selected tables in the format: { table_alias: { table_name, filter_by } }
 */
export async function buildBaseTablesMap(
  configTableRows: {
    table_name: string;
    table_alias: string;
    default_filter_column: string[]; // Supabase returns this as array already
  }[],
  selectedTableNames: string[]
): Promise<Record<string, { table_name: string; filter_by: string[] }>> {
  const baseMap: Record<string, { table_name: string; filter_by: string[] }> = {};

  for (const row of configTableRows) {
    if (selectedTableNames.includes(row.table_name)) {
      baseMap[row.table_alias] = {
        table_name: row.table_name,
        filter_by: Array.isArray(row.default_filter_column)
          ? row.default_filter_column
          : []
      };
    }
  }

  return baseMap;
}
 // END OF 



/**
 * convertMatch
 * Converts a filter rule object into a structured match format.
 * 
 * Attempts to parse the `matchTo` string as JSON to support advanced references
 * like `{ "source": "someTable", "field": "someField" }`. If parsing fails, treats
 * the value as a plain string or variable reference.
 * 
 * This function is asynchronous in case future enhancements involve lookups
 * or validation against Supabase or external sources.
 *
 * @async
 * @function
 * @param {Object} filter - A single filter rule.
 * @param {string} filter.field - The field name to filter on.
 * @param {string} filter.operator - The comparison operator (e.g., '=', 'in', '!=' etc).
 * @param {string} filter.matchTo - The match target, either a string or a JSON object reference.
 * @returns {Promise<{field: string, operator: string, matchTo: any}>} - Structured filter rule.
 *
 * @example
 * const result = await convertMatch({
 *   field: "story_id",
 *   operator: "=",
 *   matchTo: "{ \"source\": \"narrativeProjects\", \"field\": \"project_id\" }"
 * });
 * 
 * // Output:
 * // {
 * //   field: "story_id",
 * //   operator: "=",
 * //   matchTo: { source: "narrativeProjects", field: "project_id" }
 * // }
 */
export async function convertMatch(filter) {
  // Trim whitespace from the input
  const value = filter.matchTo.trim();

  let matchTo;

  try {
    // Try to parse as JSON — allows matchTo to be an object reference like { source, field }
    matchTo = JSON.parse(value);
  } catch {
    // Fallback to plain string (literal or variable-style reference)
    matchTo = value;
  }

  // Return the structured filter rule object
  return {
    field: filter.field,
    operator: filter.operator,
    matchTo
  };
} // END OF convertMatch



/**
 * generateFilterMap
 * Builds a filterMap object from filter definitions and inputs.
 * 
 * @param provided_alias - Output alias for the filterMap entry (e.g. "filteredChapters")
 * @param get_FilterMapCard_SelectedDataSource - The alias of the source table to filter from
 * @param local_filters - Array of filters to apply, each with { field, operator, matchTo }
 * @returns A filterMap object keyed by alias, or an empty object if invalid.
 */
export async function generateFilterMap(
  provided_alias: string,
  get_FilterMapCard_SelectedDataSource: string,
  local_filters: { field: string; operator: string; matchTo: string }[]
): Promise<Record<string, any>> {
  if (!provided_alias || !get_FilterMapCard_SelectedDataSource || local_filters.length === 0) return {};

  const convertMatch = async (filter: any) => {
    const value = filter.matchTo.trim();

    let matchTo;
    try {
      matchTo = JSON.parse(value); // allows JSON object syntax for `{ source, field }`
    } catch {
      matchTo = value; // treat as a literal string or variable reference
    }

    return {
      field: filter.field,
      operator: filter.operator,
      matchTo,
    };
  };

  const filterBy =
    local_filters.length === 1
      ? await convertMatch(local_filters[0])
      : await Promise.all(local_filters.map(convertMatch));

  return {
    [provided_alias]: {
      source: get_FilterMapCard_SelectedDataSource,
      target: provided_alias + 'Records',
      filterBy,
    },
  };
} // END OF generateFilterMap



/**
 * fetchTableFields
 * used in Section Map Card process
 * Fetches the list of filterable column names from the config table data for a specified Supabase table.
 *
 * This function uses preloaded config data instead of querying Supabase directly.
 *
 * @async
 * @function fetchTableFields
 * @param {string} tableName - The name of the Supabase table to look up.
 * @param {Array} get_BaseTableCard_ConfigTableData - Array of config rows containing `table_name` and `filterable_columns`.
 * @param {string} tableKeyColumn - The key used to match the table (e.g. "table_name" or "alias").
 * @param {string} filterKeyColumn - The key used to match the table (e.g. "table_name" or "alias").
 * @returns {Promise<string[]>} A promise that resolves to an array of column names.
 *
 * @example
 * const fields = await fetchTableFields("character_details", baseTableConfig, "table_name");
 * console.log(fields); // ["character_name", "story_id", ...]
 */
async function fetchTableFields(
  tableName: string,
  get_BaseTableCard_ConfigTableData: any[],
  tableKeyColumn: string,
  filterKeyColumn: string
): Promise<string[]> {
  // Try to find the matching row from config data
  const matchedRow = get_BaseTableCard_ConfigTableData.find(row => row[tableKeyColumn] === tableName);

  if (!matchedRow) {
    console.warn(`⚠️ No config entry found for '${tableName}' using key '${tableKeyColumn}'`);
    return [];
  }

  // Return the filterable columns array or an empty array
  return matchedRow[filterKeyColumn] || [];
} // END OF fetchTableFields



/**
 * buildSectionMapEntry
 * ----------------------------------------
 * Utility function to construct a sectionMap entry for the payload.
 * Each field in the section is represented as a key (the alias) with an object
 * containing the original field name and its fieldType.
 *
 * This format supports future UI editing of field alias and type, but for now,
 * assumes defaults: alias = field, fieldType = "text".
 *
 * @async
 * @function buildSectionMapEntry
 * @param {string} selectedBaseTable - The base table this section maps to.
 * @param {Array<{ field: string, alias: string, fieldType: string }>} selectedFields - Array of field config objects to include.
 * @param {boolean} isConditional - Whether to conditionally include this section at runtime.
 * @returns {Promise<Record<string, any> | null>} A properly structured section map object keyed by alias, or null if invalid input.
 *
 * @example
 * const entry = await buildSectionMapEntry(
 *   "chapters",
 *   [
 *     { field: "chapterID", alias: "chapterID", fieldType: "text" },
 *     { field: "chapterNumber", alias: "chapterNumber", fieldType: "text" },
 *     { field: "chapterKeyMoments", alias: "chapterKeyMoments", fieldType: "nestedMapping" }
 *   ],
 *   false
 * );
 * // Result:
 * // {
 * //   chapterID: { field: "chapterID", fieldType: "text" },
 * //   chapterNumber: { field: "chapterNumber", fieldType: "text" },
 * //   chapterKeyMoments: { field: "chapterKeyMoments", fieldType: "nestedMapping" }
 * // }
 */
export async function buildSectionMapEntry(
  selectedBaseTable: string,
  selectedFields: { field: string; alias: string; fieldType: string }[],
  isConditional: boolean
): Promise<Record<string, any> | null> {
  // Guard clause: return null if no table or no fields selected
  if (!selectedBaseTable || selectedFields.length === 0) {
    console.warn("❌ Missing base table or selected fields for sectionMap entry.");
    return null;
  }

  const sectionEntry: Record<string, any> = {};

  // Loop through selected field objects
  selectedFields.forEach(({ field, alias, fieldType }) => {
    // Validate field is a string — skip if not
    if (!field || typeof field !== "string") {
      console.warn("⚠️ Skipping invalid field entry:", field);
      return;
    }

    // Use alias as the key and define its mapping
    sectionEntry[alias] = {
      field,                         // original field name in the base table
      fieldType: fieldType || "text" // default to "text" if not provided
    };
  });

  // Optional: attach conditional flag using a special key if needed
  if (isConditional) {
    sectionEntry.__conditional = true;
  }

  return sectionEntry;
} // END OF buildSectionMapEntry



/**
 * toFieldsObject
 * used as part of Section Map process
 * Convert a selected-fields array into the `sectionMaps` object shape.
 *
 * Normalizes each item to `{ fieldType: string, alias: string }` and keys
 * the result by the original `field` name. Defaults `fieldType` to `"text"`
 * and `alias` to the field name when omitted. Ignores falsy/invalid entries.
 *
 * @param {Array<{field: string; alias?: string; fieldType?: string} | string>} sel
 *   The selected fields to persist. Items may be objects
 *   like `{ field: "title", alias: "title", fieldType: "text" }`
 *   or simple strings like `"title"`.
 *
 * @returns {Record<string, { fieldType: string; alias: string }>}
 *   An object map suitable for `sectionMaps[alias]`, e.g.:
 *   `{ title: { fieldType: "text", alias: "title" }, tone: { fieldType: "text", alias: "tone" } }`
 *
 * @example
 * const input = [
 *   { field: "title", fieldType: "text" },
 *   { field: "tone" }, // alias defaults to "tone", fieldType -> "text"
 *   "genre_tags",      // string entries are allowed
 * ];
 * const output = toFieldsObject(input);
 * // {
 * //   title: { fieldType: "text", alias: "title" },
 * //   tone:  { fieldType: "text", alias: "tone" },
 * //   genre_tags: { fieldType: "text", alias: "genre_tags" }
 * // }
 */
export const toFieldsObject = (
  sel: Array<{ field: string; alias?: string; fieldType?: string } | string>
): Record<string, { field: string; fieldType: string }> => {
  if (!Array.isArray(sel)) return {};

  const out: Record<string, { field: string; fieldType: string }> = {};

  for (const item of sel) {
    if (!item) continue;

    const field =
      typeof item === "string" ? item.trim() : String(item.field ?? "").trim();
    if (!field) continue;

    const aliasRaw =
      typeof item === "string" ? field : String(item.alias ?? "").trim();
    const alias = aliasRaw || field; // fallback to field when alias empty

    const fieldType =
      typeof item === "string" ? "text" : String(item.fieldType ?? "text");

    out[alias] = { field, fieldType };
  }

  return out;
} // END OF toFieldsObject



// Utils/resolveTableNameForSelection.ts

/**
 * Resolve the Supabase table_name for a given selection key.
 *
 * @param selectionKey  Base alias (e.g. "Chapter") OR filter-map target (e.g. "chapterKeyMomentsRecords").
 * @param baseTableMap  Your constructed base table map: { [alias]: { table_name: string, ... } }
 * @param filterMapMap  Your constructed filter map: { [alias]: { source: string, target?: string, ... } }
 * @returns table_name string, or null if it cannot be resolved.
 */
export function resolveTableNameForSelection(
  selectionKey: string,
  baseTableMap: Record<string, { table_name?: string } | undefined>,
  filterMapMap: Record<string, { source?: string; target?: string } | undefined>
): string | null {
  if (!selectionKey) return null;

  // 1) If the key is already a base alias, return its table_name immediately.
  const baseEntry = baseTableMap?.[selectionKey];
  if (baseEntry?.table_name) return baseEntry.table_name;

  // 2) Map a filter target -> its alias.
  const targetToAlias = (() => {
    const m = new Map<string, string>();
    if (!filterMapMap) return m;
    for (const [alias, entry] of Object.entries(filterMapMap)) {
      const target = entry?.target ?? `${alias}Records`;
      m.set(target, alias);
    }
    return m;
  })();

  // If selectionKey is a target, find the owning alias; otherwise fall back to using it as an alias.
  let alias = targetToAlias.get(selectionKey) ?? selectionKey;

  // 3) Walk alias -> ... -> base alias, guarding against cycles.
  const visited = new Set<string>();
  while (true) {
    if (visited.has(alias)) return null; // cycle
    visited.add(alias);

    const maybeBase = baseTableMap?.[alias];
    if (maybeBase?.table_name) {
      return maybeBase.table_name; // resolved!
    }

    const fm = filterMapMap?.[alias];
    if (!fm?.source) return null; // unknown alias or incomplete entry

    // fm.source is expected to be an alias; if someone stored a target, normalize it.
    alias = targetToAlias.get(fm.source) ?? fm.source;
  }
}


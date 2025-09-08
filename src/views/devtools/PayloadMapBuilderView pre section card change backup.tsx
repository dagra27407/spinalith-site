// PayloadMapBUilderView.tsx
//  Used to create payload JSON maps that are used by ef_step_assistant_PrepJSON
//  Once created these maps must be stored in wf_script_mapping_warehouse.script_mapping_json_payload

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { run_EF } from "@/lib/run_EF";
import { AutoResizeTextarea } from "@/components/ui/AutoResizeTextarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

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
    // Base Table table selection and map generations
    const [get_BaseTableCard_SelectedTables, set_BaseTableCard_SelectedTables] = useState<string[]>([]);
    const [get_BaseTableCard_ConstructedBaseTableMap, set_BaseTableCard_ConstructedBaseTableMap] = useState({});
    // filterMap DSL definition layer
    const [get_FilterMapCard_OutputAlias, set_FilterMapCard_OutputAlias] = useState('');
    const [get_FilterMapCard_SelectedDataSource, set_FilterMapCard_SelectedDataSource] = useState('');
    const [get_FilterMapCard_ConstructedFilters, set_FilterMapCard_ConstructedFilters] = useState([{ field: '', operator: '=', matchTo: '' }]);
    const [get_FilterMapCard_MapPreview, set_FilterMapCard_MapPreview] = useState<any>({});
    const [get_FilterMapCard_FieldMap, set_FilterMapCard_FieldMap] = useState<Record<string, string[]>>({});
    const [get_FilterMapCard_ConstructedFilterMap, set_FilterMapCard_ConstructedFilterMap] = useState({});
    // sectionMaps card
    type SectionFieldEntry = {
      alias: string;       // Optional override, defaults to field
      field: string;       // Actual field from the source table
      fieldType: string;   // e.g., 'text', 'nestedMapping', etc.
    };
    const [get_SectionMapCard_BaseTablesOptions, set_SectionMapCard_BaseTablesOptions] = useState<string[]>([]);
    const [get_SectionMapCard_SelectedBaseTable, set_SectionMapCard_SelectedBaseTable] = useState("");
    const [get_SectionMapCard_FieldMap, set_SectionMapCard_FieldMap] = useState<Record<string, string[]>>({});
    const [get_SectionMapCard_SelectedFields, set_SectionMapCard_SelectedFields] = useState<SectionFieldEntry[]>([]);
    const [get_SectionMapCard_ConditionalSwitch, set_SectionMapCard_ConditionalSwitch] = useState<boolean>(false);
    const [get_SectionMapCard_ConstructedMap, set_SectionMapCard_ConstructedMap] = useState<Record<string, any>>({});
    const [get_SectionMapCard_SectionAilias, set_SectionMapCard_SectionAilias] = useState('');
    const [get_SectionMapCard_ConstructedJsonOutputMap, set_SectionMapCard_ConstructedJsonOutputMap] = useState<Record<string, any>>({});
    const [get_SectionMapCard_ConstructedSectionMap, set_SectionMapCard_ConstructedSectionMap] = useState({});
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
        get_SectionMapCard_SelectedBaseTable,
        get_SectionMapCard_FieldMap,
        get_SectionMapCard_SelectedFields,
        get_SectionMapCard_ConditionalSwitch,
        get_SectionMapCard_ConstructedMap,
        get_SectionMapCard_SectionAilias,
        get_SectionMapCard_ConstructedJsonOutputMap,
        get_PayloadPreviewCard_NarrativeProjectID,
        get_PayloadPreviewCard_PreviewText,   
      };
    

      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(saveableState));
    }, [get_BaseTableCard_SelectedConfigTable, 
        get_BaseTableCard_SelectedTables, 
        get_FilterMapCard_OutputAlias, 
        get_FilterMapCard_SelectedDataSource, 
        get_FilterMapCard_ConstructedFilters,
        get_FilterMapCard_ConstructedFilterMap,
        get_SectionMapCard_SelectedBaseTable,
        get_SectionMapCard_FieldMap,
        get_SectionMapCard_SelectedFields,
        get_SectionMapCard_ConditionalSwitch,
        get_SectionMapCard_ConstructedMap,
        get_SectionMapCard_SectionAilias,
        get_SectionMapCard_ConstructedJsonOutputMap,
        get_PayloadPreviewCard_NarrativeProjectID,
        get_PayloadPreviewCard_PreviewText, ]);

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
          get_SectionMapCard_SelectedBaseTable,
          get_SectionMapCard_FieldMap,
          get_SectionMapCard_SelectedFields,
          get_SectionMapCard_ConditionalSwitch,
          get_SectionMapCard_ConstructedMap,
          get_SectionMapCard_SectionAilias,
          get_FilterMapCard_ConstructedFilterMap,
          get_SectionMapCard_ConstructedJsonOutputMap,
          get_PayloadPreviewCard_NarrativeProjectID,
          get_PayloadPreviewCard_PreviewText,
        } = JSON.parse(savedState);

        //Repopulate all visual fields from useStores
        if (get_BaseTableCard_SelectedConfigTable) set_BaseTableCard_SelectedConfigTable(get_BaseTableCard_SelectedConfigTable);
        if (get_BaseTableCard_SelectedTables) set_BaseTableCard_SelectedTables(get_BaseTableCard_SelectedTables);
        if (get_FilterMapCard_OutputAlias) set_FilterMapCard_OutputAlias(get_FilterMapCard_OutputAlias);
        if (get_FilterMapCard_SelectedDataSource) set_FilterMapCard_SelectedDataSource(get_FilterMapCard_SelectedDataSource);
        if (get_FilterMapCard_ConstructedFilters) set_FilterMapCard_ConstructedFilters(get_FilterMapCard_ConstructedFilters);
        if (get_FilterMapCard_ConstructedFilterMap) set_FilterMapCard_ConstructedFilterMap(get_FilterMapCard_ConstructedFilterMap);
        if (get_SectionMapCard_SelectedBaseTable) set_SectionMapCard_SelectedBaseTable(get_SectionMapCard_SelectedBaseTable);
        if (get_SectionMapCard_FieldMap) set_SectionMapCard_FieldMap(get_SectionMapCard_FieldMap);
        if (get_SectionMapCard_SelectedFields) set_SectionMapCard_SelectedFields(get_SectionMapCard_SelectedFields);
        if (get_SectionMapCard_ConditionalSwitch) set_SectionMapCard_ConditionalSwitch(get_SectionMapCard_ConditionalSwitch);
        if (get_SectionMapCard_ConstructedMap) set_SectionMapCard_ConstructedMap(get_SectionMapCard_ConstructedMap);
        if (get_SectionMapCard_SectionAilias) set_SectionMapCard_SectionAilias(get_SectionMapCard_SectionAilias);
        if (get_SectionMapCard_ConstructedJsonOutputMap) set_SectionMapCard_ConstructedJsonOutputMap(get_SectionMapCard_ConstructedJsonOutputMap);
        if (get_PayloadPreviewCard_NarrativeProjectID) set_PayloadPreviewCard_NarrativeProjectID(get_PayloadPreviewCard_NarrativeProjectID);
        if (get_PayloadPreviewCard_PreviewText) set_PayloadPreviewCard_PreviewText(get_PayloadPreviewCard_PreviewText);
      } catch (err) {
        console.warn("⚠️ Failed to parse saved payload builder state", err);
      }
    };
    restoreState();
    }, []);
    // #endregion

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
        const tableName = get_FieldMapPreview_Results?.baseTableMap?.[get_FilterMapCard_SelectedDataSource]?.table_name;
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

      // Ensure section map check box options update if get_SectionMapCard_SelectedBaseTable
      useEffect(() => {
        if (!get_SectionMapCard_SelectedBaseTable) return; // Skip if no source table is selected yet

        const fetchAndStoreFields = async () => {
            const tableName = get_FieldMapPreview_Results?.baseTableMap?.[get_SectionMapCard_SelectedBaseTable]?.table_name;
            if (!tableName) return;

            const fields = await fetchTableFields(tableName, get_BaseTableCard_ConfigTableData, "table_name", "filterable_columns");

            // Store the fields in the field map state (keyed by get_SectionMapCard_SelectedBaseTable)
            set_SectionMapCard_FieldMap((prev) => ({
            ...prev,
            [get_SectionMapCard_SelectedBaseTable]: fields,
            }));
        };
      
      fetchAndStoreFields();
      }, [get_SectionMapCard_SelectedBaseTable]); // <- this runs every time either value changes

      // When Constructed Map is saved after button click
      useEffect(() => {
        set_SectionMapCard_ConstructedSectionMap((prev) => ({
          ...prev,
          get_SectionMapCard_ConstructedMap,
        }));

      }, [get_SectionMapCard_ConstructedMap]);
    // #endregion

    /*-----------------------------------------------
     ------- Field Map Preview useEffects -------
     -----------------------------------------------*/
    useEffect(() => {
      set_FieldMapPreview_Results((prev) => ({
        ...prev,
        baseTableMap: get_BaseTableCard_ConstructedBaseTableMap,
        sectionMaps: get_SectionMapCard_ConstructedMap,
        filterMap: get_FilterMapCard_ConstructedFilterMap,
        jsonOutputMap: get_SectionMapCard_ConstructedJsonOutputMap,
      }));
    }, [
      get_BaseTableCard_ConstructedBaseTableMap,
      get_SectionMapCard_ConstructedMap,
      get_FilterMapCard_ConstructedFilterMap,
      get_SectionMapCard_ConstructedJsonOutputMap,
    ]);


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
        set_FilterMapCard_MapPreview(get_FilterMapCard_ConstructedFilters);
    };

    // Add new filter rule
    const addFilter = () => {
      const updatedFilters = [...get_FilterMapCard_ConstructedFilters, { field: '', operator: '=', matchTo: '' }];
      set_FilterMapCard_ConstructedFilters(updatedFilters); //update the useState with added filter
      set_FilterMapCard_MapPreview(updatedFilters); //display the update in preview
    };

    // Removes a filter at the given index.
    const removeFilter = (index: number) => {
      const updatedFilters = get_FilterMapCard_ConstructedFilters.filter((_, i) => i !== index);
      set_FilterMapCard_ConstructedFilters(updatedFilters); //update the useState with added filter
      set_FilterMapCard_MapPreview(updatedFilters); //display the update in preview
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


    // onClick of Add Section Map button, builds the seciton map
    const handleAddSectionMap = async () => {
      // Step 1: Validate section alias
      const sectionKey = get_SectionMapCard_SectionAilias.trim();
      if (!sectionKey) {
        console.warn("❌ Section alias is required.");
        return;
      }

      // Step 2: Build the section map entry using selected field configs
      const sectionEntry = await buildSectionMapEntry(
        get_SectionMapCard_SelectedBaseTable,
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
            source: get_SectionMapCard_SelectedBaseTable,
            sectionMapKey: sectionKey,
            conditional: get_SectionMapCard_ConditionalSwitch,
          },
        }));
    };

    // #endregion

    /*----------------------------------------------
    ------------- Generate Payload Card ------------
    ----------------- Event Hanlers ----------------
    -----------------------------------------------*/
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
      set_BaseTableCard_ConfigTableData([]);
      set_BaseTableCard_SelectedTables([]);
      set_FilterMapCard_OutputAlias('');
      set_FilterMapCard_SelectedDataSource('');
      set_FilterMapCard_ConstructedFilters([{ field: '', operator: '=', matchTo: '' }]);
      set_FilterMapCard_MapPreview({});
      set_SectionMapCard_BaseTablesOptions([]);
      set_SectionMapCard_SelectedBaseTable("");
      set_SectionMapCard_FieldMap({});
      set_SectionMapCard_SelectedFields([]);
      set_SectionMapCard_ConditionalSwitch(false);
      set_SectionMapCard_ConstructedMap({});
      set_FieldMapPreview_Results({
        baseTableMap: {},
        jsonOutputMap: {},
        filterMap: {},
        sectionMaps: {},
        nestedMappingKey: {},
      });
    };



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
                    <CardTitle>Create Custom Filtered Recordset</CardTitle>
                    <CardDescription>
                    Define a named filtered data source based on an existing base table.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
      {/* Output Alias */}
                    <div>
                    <Label>Output Alias</Label>
                    <Input value={get_FilterMapCard_OutputAlias} onChange={(e) => set_FilterMapCard_OutputAlias(e.target.value)} />
                    </div>

      {/* Source Table Dropdown */}
                    <div>
                    <Label>Source Table</Label>
                    <Select value={get_FilterMapCard_SelectedDataSource} onValueChange={handleSourceTableSelect}>
                        <SelectTrigger>
                        <SelectValue placeholder="Select source data" />
                        </SelectTrigger>
                        <SelectContent>
                        {(get_FieldMapPreview_Results?.baseTableMap
                            ? Object.keys(get_FieldMapPreview_Results.baseTableMap)
                            : []
                            ).map((aliasKey) => (
                            <SelectItem key={aliasKey} value={aliasKey}>
                                {aliasKey}
                            </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    </div>

      {/* Filter Rules */}
                    <div className="space-y-2">
                      <Label>Filter Rules</Label>
                      {get_FilterMapCard_ConstructedFilters.map((filter, index) => (
                          <div key={index} className="grid grid-cols-4 gap-2 items-center">
      {/* Table Field Dropdown */}
                          <Select 
                              value={filter.field}
                              onValueChange={(value) => updateFilter(index, 'field', value)}
                              >
                              <SelectTrigger>
                                  <SelectValue placeholder="Field" />
                              </SelectTrigger>
                              <SelectContent>
                                  {(get_FilterMapCard_FieldMap[get_FilterMapCard_SelectedDataSource] || []).map((fieldName) => (
                                  <SelectItem key={fieldName} value={fieldName}>
                                      {fieldName}
                                  </SelectItem>
                                  ))}
                              </SelectContent>
                          </Select>

                          <Select
                              value={filter.operator}
                              onValueChange={(value) => updateFilter(index, 'operator', value)}
                          >
                              <SelectTrigger><SelectValue placeholder="Operator" /></SelectTrigger>
                              <SelectContent>
                              {['=', 'in', '!=', 'like'].map((op) => (
                                  <SelectItem key={op} value={op}>{op}</SelectItem>
                              ))}
                              </SelectContent>
                          </Select>
                          <Input
                              placeholder="Match To"
                              value={filter.matchTo}
                              onChange={(e) => updateFilter(index, 'matchTo', e.target.value)}
                          />
                          <Button
                              variant="destructive"
                              onClick={() => removeFilter(index)}
                          >
                              Remove
                          </Button>
                          </div>
                        
                      ))}
                      <div className="flex justify-right gap-4">
                        <Button onClick={addFilter}>+ Add Filter Rule</Button>
                        <Button onClick={handleAddFilterToPayloadMap}>
                            Push to Payload Map
                        </Button>
                      </div>
                    </div>


      {/* Filter Output Preview */}
                    <div>
                    <Label>Generated Map Entry</Label>
                    <Textarea
                        readOnly
                        value={JSON.stringify(get_FilterMapCard_MapPreview, null, 2)}
                        className="font-mono bg-muted"
                        rows={Math.max(6, JSON.stringify(get_FilterMapCard_MapPreview).split('\n').length)}
                    />
                    </div>
                </CardContent>
                </Card>

  {/* Section Map Card */}
                {get_SectionMapCard_BaseTablesOptions.length > 0 && (
                  <Card>
                    <CardHeader>
                      <Styled_CardHeader>Section Map</Styled_CardHeader>
                      <CardDescription>Construct your JSON Payload Section.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex flex-col space-y-2">
                        <Label>Section Name:</Label>
                        <Input 
                              placeholder="Section Name"
                              value={get_SectionMapCard_SectionAilias}
                              onChange={(e) => set_SectionMapCard_SectionAilias (e.target.value)}
                          />
                        <Label>Choose the sections source data:</Label>
                        <Select value={get_SectionMapCard_SelectedBaseTable} onValueChange={set_SectionMapCard_SelectedBaseTable}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a section table" />
                          </SelectTrigger>
                          <SelectContent>
                            {get_SectionMapCard_BaseTablesOptions.map((tableName) => (
                              <SelectItem key={tableName} value={tableName}>
                                {tableName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div className="flex gap-2">
                          <Label>Conditional Inclusion?</Label>
                          <Switch 
                            checked={get_SectionMapCard_ConditionalSwitch}
                            onCheckedChange={(value) => set_SectionMapCard_ConditionalSwitch(value)}
                          >
                              Conditional
                          </Switch>
                        </div>
                        {get_SectionMapCard_FieldMap[get_SectionMapCard_SelectedBaseTable]?.length > 0 && (
                          <>
                            <Separator className="my-4" />
                            <Label className="font-bold mt-4">Select Fields to Include in Section Mapping</Label>
                            <div className="space-y-2">
                              {get_SectionMapCard_FieldMap[get_SectionMapCard_SelectedBaseTable]
                                .sort()
                                .map((fieldName) => (
                                  <div key={fieldName} className="flex items-center space-x-2">
                                    <input
                                      type="checkbox"
                                      checked={get_SectionMapCard_SelectedFields.some(entry => entry.field === fieldName)}
                                      onChange={() => toggleSectionField(fieldName)}
                                      className="accent-primary"
                                    />
                                    <span>{fieldName}</span>
                                  </div>
                                ))}
                            </div>
                          </>
                        )}
                        <Button onClick={handleAddSectionMap}>Add Section Map</Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

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
                          className="bg-muted p-4 rounded text-xs overflow-auto max-h-[400px]"
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
                <CardContent className="space-y-4">
                    <Styled_CardHeader>Field Map Library</Styled_CardHeader>
                    <pre className="bg-muted p-4 rounded text-xs overflow-auto max-h-[80vh]">
                    {get_FieldMapPreview_Results
                        ? JSON.stringify(get_FieldMapPreview_Results, null, 2)
                        : "// Map preview will appear here after generation"}
                    </pre>
                </CardContent>
                </Card>
            </div>
        </div>

    );
}

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


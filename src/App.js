import React, { useState, useCallback, useMemo, useEffect, useRef } from "react";
import checklistData from "./checklistData";
import {
  designBriefFields,
  needAnalysisFields,
  functionDefinitionFields,
  newConceptFields,
} from "./sectionsData";
import "./App.css";

const sectionMeta = [
  { key: "designBrief", title: "1. Design Brief", subtitle: "Define the assignment: what is being designed, for whom, and under what constraints.", color: "#D97706", tint: "#FFF7E6", fields: designBriefFields },
  { key: "needAnalysis", title: "2. Need Analysis", subtitle: "Identify and prioritise the needs the product must satisfy.", color: "#7C3AED", tint: "#F5F0FF", fields: needAnalysisFields },
  { key: "functionDefinition", title: "3. Function Definition", subtitle: "Translate needs into the functions the product must perform.", color: "#0891B2", tint: "#E6F7FB", fields: functionDefinitionFields },
];

const NEW_CONCEPT_COLOR = "#3EAB3F";
const NEW_CONCEPT_TINT = "#F1F8F1";

const STORAGE_KEY = "ssi_ecodesign_checklist_v1";
const SCHEMA_VERSION = 1;

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.version !== SCHEMA_VERSION) return null;
    return parsed;
  } catch (err) {
    return null;
  }
}

function App() {
  const initial = useRef(loadFromStorage()).current;

  const [checkedItems, setCheckedItems] = useState(() => initial?.checkedItems || {});
  const [notes, setNotes] = useState(() => initial?.notes || {});
  const [expandedStrategies, setExpandedStrategies] = useState(
    () => new Set(checklistData.map((s) => s.id))
  );
  const [projectName, setProjectName] = useState(() => initial?.projectName || "");
  const [teamMember, setTeamMember] = useState(() => initial?.teamMember || "");
  const [sectionData, setSectionData] = useState(() => initial?.sectionData || {});
  const [conceptData, setConceptData] = useState(() => initial?.conceptData || {});
  const [expandedSections, setExpandedSections] = useState(
    () => new Set(["designBrief", "needAnalysis", "functionDefinition", "newConcept"])
  );
  const [savedAt, setSavedAt] = useState(() => initial?.savedAt || null);
  const [importMessage, setImportMessage] = useState("");
  const fileInputRef = useRef(null);
  const isFirstRunRef = useRef(true);

  useEffect(() => {
    if (isFirstRunRef.current) {
      isFirstRunRef.current = false;
      return;
    }
    const payload = {
      version: SCHEMA_VERSION,
      savedAt: new Date().toISOString(),
      projectName,
      teamMember,
      checkedItems,
      notes,
      sectionData,
      conceptData,
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      setSavedAt(payload.savedAt);
    } catch (err) {
      console.warn("Could not auto-save", err);
    }
  }, [projectName, teamMember, checkedItems, notes, sectionData, conceptData]);

  const updateSectionField = useCallback((fieldId, value) => {
    setSectionData((prev) => ({ ...prev, [fieldId]: value }));
  }, []);

  const updateConceptField = useCallback((fieldId, value) => {
    setConceptData((prev) => ({ ...prev, [fieldId]: value }));
  }, []);

  const toggleSection = useCallback((key) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const toggleCheck = useCallback((itemId) => {
    setCheckedItems((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
  }, []);

  const updateNote = useCallback((itemId, value) => {
    setNotes((prev) => ({ ...prev, [itemId]: value }));
  }, []);

  const toggleStrategy = useCallback((strategyId) => {
    setExpandedStrategies((prev) => {
      const next = new Set(prev);
      if (next.has(strategyId)) next.delete(strategyId);
      else next.add(strategyId);
      return next;
    });
  }, []);

  const totalItems = useMemo(
    () => checklistData.reduce((sum, s) => sum + s.items.length, 0),
    []
  );

  const totalChecked = useMemo(
    () => Object.values(checkedItems).filter(Boolean).length,
    [checkedItems]
  );

  const getStrategyProgress = useCallback(
    (strategy) => {
      const checked = strategy.items.filter((i) => checkedItems[i.id]).length;
      return { checked, total: strategy.items.length };
    },
    [checkedItems]
  );

  const overallPercent = totalItems > 0 ? Math.round((totalChecked / totalItems) * 100) : 0;

  const expandAll = () => {
    setExpandedStrategies(new Set(checklistData.map((s) => s.id)));
    setExpandedSections(new Set(["designBrief", "needAnalysis", "functionDefinition", "newConcept"]));
  };
  const collapseAll = () => {
    setExpandedStrategies(new Set());
    setExpandedSections(new Set());
  };

  const exportReport = () => {
    const now = new Date().toLocaleString();
    let report = `ECODESIGN CHECKLIST REPORT\n`;
    report += `${"=".repeat(50)}\n`;
    report += `Based on: Brezet (1997) EcoDesign Checklist\n\n`;
    report += `Project: ${projectName || "(not specified)"}\n`;
    report += `Assessed by: ${teamMember || "(not specified)"}\n`;
    report += `Date: ${now}\n`;
    report += `Overall Progress: ${totalChecked}/${totalItems} (${overallPercent}%)\n\n`;

    sectionMeta.forEach((section) => {
      report += `\n${"=".repeat(50)}\n`;
      report += `${section.title}\n`;
      report += `${"=".repeat(50)}\n`;
      section.fields.forEach((f) => {
        const val = sectionData[f.id] || "(not specified)";
        report += `\n${f.label}:\n  ${val.split("\n").join("\n  ")}\n`;
      });
    });

    report += `\n\n${"=".repeat(50)}\n`;
    report += `4. ECODESIGN STRATEGIES (Brezet 1997)\n`;
    report += `${"=".repeat(50)}\n`;

    checklistData.forEach((strategy) => {
      const prog = getStrategyProgress(strategy);
      report += `\n${"─".repeat(50)}\n`;
      report += `${strategy.id}. ${strategy.strategy} [${prog.checked}/${prog.total}]\n`;
      report += `${"─".repeat(50)}\n`;
      strategy.items.forEach((item) => {
        const status = checkedItems[item.id] ? "YES" : "NO ";
        report += `  [${status}] ${item.text}\n`;
        if (notes[item.id]) {
          report += `      Note: ${notes[item.id]}\n`;
        }
      });
    });

    report += `\n\n${"=".repeat(50)}\n`;
    report += `5. NEW CONCEPT — FULL DESCRIPTION\n`;
    report += `${"=".repeat(50)}\n`;
    newConceptFields.forEach((f) => {
      const val = conceptData[f.id] || "(not specified)";
      report += `\n${f.label}:\n  ${val.split("\n").join("\n  ")}\n`;
    });

    const blob = new Blob([report], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ecodesign-checklist-${projectName || "report"}-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetAll = () => {
    if (window.confirm("Reset all sections, checklist items, and notes? This cannot be undone.")) {
      setCheckedItems({});
      setNotes({});
      setSectionData({});
      setConceptData({});
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (err) {
        // ignore
      }
      setSavedAt(null);
    }
  };

  const saveToFile = () => {
    const payload = {
      version: SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      projectName,
      teamMember,
      checkedItems,
      notes,
      sectionData,
      conceptData,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const safeName = (projectName || "ecodesign").replace(/[^a-z0-9-_]+/gi, "_");
    a.href = url;
    a.download = `ecodesign-${safeName}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const triggerLoadFromFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);
        if (!parsed || parsed.version !== SCHEMA_VERSION) {
          throw new Error("Unsupported or missing version");
        }
        if (
          !window.confirm(
            "Load this file? Current data will be replaced (auto-saved data may also be overwritten)."
          )
        ) {
          return;
        }
        setProjectName(parsed.projectName || "");
        setTeamMember(parsed.teamMember || "");
        setCheckedItems(parsed.checkedItems || {});
        setNotes(parsed.notes || {});
        setSectionData(parsed.sectionData || {});
        setConceptData(parsed.conceptData || {});
        setImportMessage(`Loaded ${file.name}`);
        setTimeout(() => setImportMessage(""), 4000);
      } catch (err) {
        setImportMessage(`Could not load: ${err.message}`);
        setTimeout(() => setImportMessage(""), 6000);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const formatSavedAt = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    const now = new Date();
    const sameDay = d.toDateString() === now.toDateString();
    if (sameDay) {
      return `Saved ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    }
    return `Saved ${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  };

  const renderSectionCard = (section) => {
    const isExpanded = expandedSections.has(section.key);
    const filledCount = section.fields.filter((f) => (sectionData[f.id] || "").trim()).length;
    const pct = Math.round((filledCount / section.fields.length) * 100);
    return (
      <div key={section.key} className="strategy-card" style={{ borderColor: section.color }}>
        <div
          className="strategy-header"
          onClick={() => toggleSection(section.key)}
          style={{ borderLeftColor: section.color, background: section.tint }}
        >
          <div className="strategy-title-row">
            <span className="strategy-icon" style={{ backgroundColor: section.color }}>
              &#9998;
            </span>
            <div className="strategy-info">
              <h2>{section.title}</h2>
              <p>{section.subtitle}</p>
            </div>
            <div className="strategy-meta">
              <div className="strategy-badge" style={{ backgroundColor: section.color }}>
                {filledCount}/{section.fields.length}
              </div>
              <span className="chevron">{isExpanded ? "▾" : "▸"}</span>
            </div>
          </div>
          <div className="strategy-progress-track">
            <div
              className="strategy-progress-fill"
              style={{ width: `${pct}%`, backgroundColor: section.color }}
            />
          </div>
        </div>
        {isExpanded && (
          <div className="section-fields">
            {section.fields.map((field) => (
              <div key={field.id} className="section-field">
                <label className="section-field-label">{field.label}</label>
                {field.multiline ? (
                  <textarea
                    className="section-textarea"
                    rows={3}
                    placeholder={field.placeholder}
                    value={sectionData[field.id] || ""}
                    onChange={(e) => updateSectionField(field.id, e.target.value)}
                  />
                ) : (
                  <input
                    type="text"
                    className="section-input"
                    placeholder={field.placeholder}
                    value={sectionData[field.id] || ""}
                    onChange={(e) => updateSectionField(field.id, e.target.value)}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderNewConceptCard = () => {
    const isExpanded = expandedSections.has("newConcept");
    const color = NEW_CONCEPT_COLOR;
    const filledCount = newConceptFields.filter((f) => (conceptData[f.id] || "").trim()).length;
    const pct = Math.round((filledCount / newConceptFields.length) * 100);
    return (
      <div className="strategy-card concept-card" style={{ borderColor: color }}>
        <div
          className="strategy-header"
          onClick={() => toggleSection("newConcept")}
          style={{ borderLeftColor: color, background: NEW_CONCEPT_TINT }}
        >
          <div className="strategy-title-row">
            <span className="strategy-icon" style={{ backgroundColor: color }}>
              &#10026;
            </span>
            <div className="strategy-info">
              <h2>5. New Concept &mdash; Full Description</h2>
              <p>Synthesise findings into the proposed eco-design concept.</p>
            </div>
            <div className="strategy-meta">
              <div className="strategy-badge" style={{ backgroundColor: color }}>
                {filledCount}/{newConceptFields.length}
              </div>
              <span className="chevron">{isExpanded ? "▾" : "▸"}</span>
            </div>
          </div>
          <div className="strategy-progress-track">
            <div
              className="strategy-progress-fill"
              style={{ width: `${pct}%`, backgroundColor: color }}
            />
          </div>
        </div>
        {isExpanded && (
          <div className="section-fields">
            {newConceptFields.map((field) => (
              <div key={field.id} className="section-field">
                <label className="section-field-label">{field.label}</label>
                {field.multiline ? (
                  <textarea
                    className="section-textarea"
                    rows={4}
                    placeholder={field.placeholder}
                    value={conceptData[field.id] || ""}
                    onChange={(e) => updateConceptField(field.id, e.target.value)}
                  />
                ) : (
                  <input
                    type="text"
                    className="section-input"
                    placeholder={field.placeholder}
                    value={conceptData[field.id] || ""}
                    onChange={(e) => updateConceptField(field.id, e.target.value)}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <a
            href="https://sustainability-and-social-innovation.com"
            target="_blank"
            rel="noopener noreferrer"
            className="ssi-logo"
            aria-label="SSi Lab"
          >
            <span className="ssi-mark">S</span>
            <span className="ssi-rest">Si Lab</span>
          </a>
          <div className="header-divider" />
          <div className="header-text">
            <div className="lab-tagline">Sustainability &amp; Social Innovation Lab</div>
            <h1>EcoDesign Checklist</h1>
            <p className="subtitle">
              Based on Brezet (1997) &mdash; A team workflow for sustainable product development
            </p>
          </div>
        </div>
      </header>

      <div className="project-bar">
        <div className="project-fields">
          <label>
            <span className="field-label">Project Name</span>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Enter project name..."
            />
          </label>
          <label>
            <span className="field-label">Assessed By</span>
            <input
              type="text"
              value={teamMember}
              onChange={(e) => setTeamMember(e.target.value)}
              placeholder="Team member name..."
            />
          </label>
        </div>
        <div className="project-actions">
          <button className="btn btn-outline" onClick={expandAll}>Expand All</button>
          <button className="btn btn-outline" onClick={collapseAll}>Collapse All</button>
          <button className="btn btn-outline" onClick={saveToFile} title="Download a .json snapshot to your computer">Save File</button>
          <button className="btn btn-outline" onClick={triggerLoadFromFile} title="Load a previously saved .json snapshot">Load File</button>
          <button className="btn btn-primary" onClick={exportReport}>Export Report</button>
          <button className="btn btn-danger" onClick={resetAll}>Reset</button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            style={{ display: "none" }}
            onChange={handleFileSelected}
          />
        </div>
      </div>

      <div className="save-status">
        <span className="save-dot" />
        <span className="save-text">
          {savedAt ? formatSavedAt(savedAt) : "Auto-saving to this browser"}
          <span className="save-divider"> &middot; </span>
          <span className="save-hint">
            Your work is auto-saved to this browser. Use <strong>Save File</strong> to download a snapshot you can share or back up.
          </span>
        </span>
        {importMessage && <span className="save-import">{importMessage}</span>}
      </div>

      <div className="progress-overview">
        <div className="progress-text">
          <span className="progress-label">Overall Progress</span>
          <span className="progress-count">
            {totalChecked} / {totalItems} items ({overallPercent}%)
          </span>
        </div>
        <div className="progress-bar-track">
          <div
            className="progress-bar-fill"
            style={{ width: `${overallPercent}%` }}
          />
        </div>
      </div>

      <div className="strategies">
        {sectionMeta.map((s) => renderSectionCard(s))}

        <div className="section-divider" style={{ borderBottomColor: "#3EAB3F" }}>
          <span className="section-divider-mark" style={{ background: "#3EAB3F" }} />
          <span className="section-divider-label">4. EcoDesign Strategies (Brezet, 1997)</span>
        </div>

        {checklistData.map((strategy) => {
          const prog = getStrategyProgress(strategy);
          const isExpanded = expandedStrategies.has(strategy.id);
          const strategyPercent = Math.round((prog.checked / prog.total) * 100);

          return (
            <div key={strategy.id} className="strategy-card">
              <div
                className="strategy-header"
                onClick={() => toggleStrategy(strategy.id)}
                style={{ borderLeftColor: strategy.color }}
              >
                <div className="strategy-title-row">
                  <span
                    className="strategy-number"
                    style={{ backgroundColor: strategy.color }}
                  >
                    4.{strategy.id}
                  </span>
                  <div className="strategy-info">
                    <h2>{strategy.strategy}</h2>
                    <p>{strategy.description}</p>
                  </div>
                  <div className="strategy-meta">
                    <div
                      className="strategy-badge"
                      style={{ backgroundColor: strategy.color }}
                    >
                      {prog.checked}/{prog.total}
                    </div>
                    <span className="chevron">{isExpanded ? "▾" : "▸"}</span>
                  </div>
                </div>
                <div className="strategy-progress-track">
                  <div
                    className="strategy-progress-fill"
                    style={{
                      width: `${strategyPercent}%`,
                      backgroundColor: strategy.color,
                    }}
                  />
                </div>
              </div>

              {isExpanded && (
                <div className="strategy-items">
                  {strategy.items.map((item) => (
                    <div
                      key={item.id}
                      className={`checklist-item ${checkedItems[item.id] ? "checked" : ""}`}
                    >
                      <div className="item-row">
                        <label className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={!!checkedItems[item.id]}
                            onChange={() => toggleCheck(item.id)}
                          />
                          <span
                            className="checkmark"
                            style={{ borderColor: strategy.color }}
                          >
                            {checkedItems[item.id] && (
                              <span
                                className="checkmark-icon"
                                style={{ color: strategy.color }}
                              >
                                &#10003;
                              </span>
                            )}
                          </span>
                          <span className="item-id">{item.id}</span>
                          <span className="item-text">{item.text}</span>
                        </label>
                      </div>
                      <div className="note-row">
                        <input
                          type="text"
                          className="note-input"
                          placeholder="Add a note or action item..."
                          value={notes[item.id] || ""}
                          onChange={(e) => updateNote(item.id, e.target.value)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        <div className="section-divider" style={{ borderBottomColor: NEW_CONCEPT_COLOR }}>
          <span className="section-divider-mark" style={{ background: NEW_CONCEPT_COLOR }} />
          <span className="section-divider-label">5. New Concept</span>
        </div>

        {renderNewConceptCard()}
      </div>

      <footer className="footer">
        <span className="footer-brand">SSi Lab &mdash; Sustainability &amp; Social Innovation Lab</span>
        <p>
          EcoDesign Checklist based on Brezet, H. (1997).{" "}
          <em>
            EcoDesign: A Promising Approach to Sustainable Production and
            Consumption.
          </em>{" "}
          UNEP, Paris.
        </p>
        <p style={{ marginTop: 8 }}>
          <a
            href="https://sustainability-and-social-innovation.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            sustainability-and-social-innovation.com
          </a>
        </p>
      </footer>
    </div>
  );
}

export default App;

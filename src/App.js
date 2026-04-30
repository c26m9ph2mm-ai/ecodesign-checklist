import React, { useState, useCallback, useMemo } from "react";
import checklistData from "./checklistData";
import "./App.css";

function App() {
  const [checkedItems, setCheckedItems] = useState({});
  const [notes, setNotes] = useState({});
  const [expandedStrategies, setExpandedStrategies] = useState(
    () => new Set(checklistData.map((s) => s.id))
  );
  const [projectName, setProjectName] = useState("");
  const [teamMember, setTeamMember] = useState("");

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

  const expandAll = () => setExpandedStrategies(new Set(checklistData.map((s) => s.id)));
  const collapseAll = () => setExpandedStrategies(new Set());

  const exportReport = () => {
    const now = new Date().toLocaleString();
    let report = `ECODESIGN CHECKLIST REPORT\n`;
    report += `${"=".repeat(50)}\n`;
    report += `Based on: Brezet (1997) EcoDesign Checklist\n\n`;
    report += `Project: ${projectName || "(not specified)"}\n`;
    report += `Assessed by: ${teamMember || "(not specified)"}\n`;
    report += `Date: ${now}\n`;
    report += `Overall Progress: ${totalChecked}/${totalItems} (${overallPercent}%)\n\n`;

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

    const blob = new Blob([report], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ecodesign-checklist-${projectName || "report"}-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetAll = () => {
    if (window.confirm("Reset all checklist items and notes? This cannot be undone.")) {
      setCheckedItems({});
      setNotes({});
    }
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <div className="header-icon">&#9851;</div>
          <div>
            <h1>EcoDesign Checklist</h1>
            <p className="subtitle">
              Based on Brezet (1997) &mdash; Systematic eco-design strategies for sustainable product development
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
          <button className="btn btn-primary" onClick={exportReport}>Export Report</button>
          <button className="btn btn-danger" onClick={resetAll}>Reset</button>
        </div>
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
                    {strategy.id}
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
      </div>

      <footer className="footer">
        <p>
          EcoDesign Checklist based on Brezet, H. (1997).{" "}
          <em>
            EcoDesign: A Promising Approach to Sustainable Production and
            Consumption.
          </em>{" "}
          UNEP, Paris.
        </p>
      </footer>
    </div>
  );
}

export default App;

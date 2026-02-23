import { useEffect, useRef, useState } from "react";
import { createPluginUI } from "molstar/lib/mol-plugin-ui";
import { renderReact18 } from "molstar/lib/mol-plugin-ui/react18";
import { DefaultPluginSpec } from "molstar/lib/mol-plugin/spec";
import "molstar/lib/mol-plugin-ui/skin/light.scss";
import "./MolstarViewer.css";
import { ToastContainer, toast } from "react-toastify";

export default function MolstarViewer({ uploadedFile, handleSaveButton }) {
  const viewerRef = useRef(null);
  const pluginRef = useRef(null);
  const [saveEnabled, setSaveEnabled] = useState(false);
  const [resetEnabled, setResetEnabled] = useState(false);

  useEffect(() => handleSaveButton(saveEnabled), [saveEnabled]);

  useEffect(() => {
    if (!uploadedFile) return;
    (async () => {
      pluginRef.current = await createPluginUI({
        target: viewerRef.current,
        render: renderReact18,
        spec: DefaultPluginSpec(),
      });

      const molx = localStorage.getItem("molx_session");
      if (molx) {
        await pluginRef.current.state.setSnapshot(JSON.parse(molx));
        setResetEnabled(true);
        setSaveEnabled(false);
        return;
      }

      const text = await uploadedFile.text();
      const data = await pluginRef.current.builders.data.rawData({
        data: text,
        label: uploadedFile.name,
      });
      const format = uploadedFile.name.endsWith(".cif") ? "mmcif" : "pdb";
      const trajectory =
        await pluginRef.current.builders.structure.parseTrajectory(
          data,
          format,
        );
      await pluginRef.current.builders.structure.hierarchy.applyPreset(
        trajectory,
        "default",
      );

      pluginRef.current.state.events.cell.stateUpdated.subscribe((update) => {
        const cell = update.cell;
        if (!cell || !cell.obj) return;

        const type = cell.obj?.type?.name || "";
        if (
          type === "Canvas3D" ||
          type === "Structure" ||
          type === "Representation"
        ) {
          setSaveEnabled(true);
        }
      });
    })();

    return () => pluginRef.current?.dispose();
  }, [uploadedFile, resetEnabled]);

  const saveSession = async () => {
    const snapshot = await pluginRef.current.state.getSnapshot();
    localStorage.setItem("molx_session", JSON.stringify(snapshot));
    setResetEnabled(true);
    toast.success("View saved successfully.");
    toast.info(
      "Re-upload the same file to verify that your changes are preserved after a refresh.",
    );
  };

  const resetSession = async () => {
    localStorage.removeItem("molx_session");
    setResetEnabled(false);
    toast.success("View reset successfully.");
  };

  return (
    <div className="molview-page">
      <div className="button-header">
        <button onClick={saveSession} disabled={!saveEnabled}>
          Save View
        </button>
        <button onClick={resetSession} disabled={!resetEnabled}>
          Reset
        </button>
      </div>
      <div style={{ width: "75%", height: "75%" }}>
        <div ref={viewerRef} style={{ width: "100%", height: "600px" }} />
      </div>
      <ToastContainer
        className="toaster"
        position="bottom-right"
        autoClose={4000}
        hideProgressBar
      />
    </div>
  );
}

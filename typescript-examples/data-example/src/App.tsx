import { FC, useEffect, useMemo, useRef, useState } from "react";
import {
  createMap,
  Dataset,
  DatasetWithData,
  MapApi,
} from "@foursquare/map-sdk";
import { SampleDataItem, fetchSampleData } from "./sample-data";

const getFirstDataset = (map: MapApi): Dataset => {
  const dataset = map.getDatasets()[0];
  if (!dataset) {
    throw new Error("No dataset.");
  } else {
    return dataset;
  }
};

export const App: FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<MapApi | null>(null);
  const [displayedDataset, setDisplayedDataset] =
    useState<DatasetWithData | null>(null);
  const [sampleData, setSampleData] = useState<
    [SampleDataItem, SampleDataItem] | null
  >(null);

  useEffect(() => {
    const loadData = async () => {
      setSampleData(await fetchSampleData());
    };

    const initMap = async () => {
      const map = await createMap({
        // This is an API Key that only works for these examples.
        // Provide your own Map SDK API Key instead.
        // For more details, see: https://docs.foursquare.com/developer/docs/studio-map-sdk-authentication
        apiKey: "fsq3CYDP77ybwoo1KtkJigGRj6g0uYyhWVw25jM+zN6ovbI=",
        container: containerRef.current!,
      });

      setMap(map);
    };

    initMap();
    loadData();
  }, []);

  const handlers = useMemo(() => {
    if (!sampleData) {
      console.log("Data not yet loaded.");
      return null;
    }

    if (!map) {
      console.log("Map not yet initialized.");
      return null;
    }

    return {
      addDataset: () => {
        if (map.getDatasets().length > 0) {
          console.log(
            "Dataset already added to the map. (Example is limited to one dataset)."
          );
          return;
        }

        map.addDataset(sampleData[0]);
      },
      updateDataset: () => {
        const dataset = getFirstDataset(map);
        const updatedLabel = "Updated Dataset";
        const updatedColor = [
          Math.floor(Math.random() * 256),
          Math.floor(Math.random() * 256),
          Math.floor(Math.random() * 256),
        ] as [number, number, number];

        map.updateDataset(dataset.id, {
          label: updatedLabel,
          color: updatedColor,
        });
      },
      replaceDataset: () => {
        map.replaceDataset(sampleData[0].id, {
          id: sampleData[1].id,
          label: sampleData[1].label,
          data: sampleData[1].data,
        });

        // round robin swap
        setSampleData([sampleData[1], sampleData[0]]);
      },
      displayDataset: () => {
        const dataset = getFirstDataset(map);
        const datasetData = map.getDatasetWithData(dataset.id);
        setDisplayedDataset(datasetData);
      },
      removeDataset: () => {
        const dataset = getFirstDataset(map);
        map.removeDataset(dataset.id);
      },
    };
  }, [map, sampleData]);

  return (
    <>
      <div id="map-container" ref={containerRef}></div>
      {!!handlers && (
        <div className="controls">
          {/* Buttons for various dataset operations */}
          <button onClick={handlers.addDataset}>Add Dataset</button>
          <button onClick={handlers.updateDataset}>Update Dataset</button>
          <button onClick={handlers.replaceDataset}>Replace Dataset</button>
          <button onClick={handlers.displayDataset}>Get Dataset</button>
          <button onClick={handlers.removeDataset}>Remove Dataset</button>
        </div>
      )}

      {/* JSON popup */}
      {!!displayedDataset && (
        <div className="json-popup">
          <div className="json-popup-content">
            <button onClick={() => setDisplayedDataset(null)}>Close</button>
            <pre>{JSON.stringify(displayedDataset, null, 2)}</pre>
          </div>
        </div>
      )}
    </>
  );
};

"use client";
import ForestScene from "./ForestScene";
import NightScene from "./NightScene";
import CottageScene from "./CottageScene";
import KitchenScene from "./KitchenScene";
import MeadowScene from "./MeadowScene";
import CastleScene from "./CastleScene";
import DarkForestScene from "./DarkForestScene";
import RoadScene from "./RoadScene";
import WinterScene from "./WinterScene";
import StormScene from "./StormScene";
import RiverScene from "./RiverScene";
import GardenScene from "./GardenScene";
import CharacterDisplay from "./CharacterDisplay";

interface SceneRendererProps {
  scene: string;
  character: string;
  characterExtra?: string;
  bgGradient: string;
}

function SceneBackground({ scene }: { scene: string }) {
  switch (scene) {
    case "forest": return <ForestScene />;
    case "night": return <NightScene />;
    case "cottage": return <CottageScene />;
    case "kitchen": return <KitchenScene />;
    case "meadow": return <MeadowScene />;
    case "castle": return <CastleScene />;
    case "dark_forest": return <DarkForestScene />;
    case "road": return <RoadScene />;
    case "winter": return <WinterScene />;
    case "storm": return <StormScene />;
    case "river": return <RiverScene />;
    case "garden": return <GardenScene />;
    default: return <MeadowScene />;
  }
}

export default function SceneRenderer({ scene, character, characterExtra }: SceneRendererProps) {
  return (
    <div className="relative w-full overflow-hidden rounded-2xl shadow-lg" style={{ height: 288 }}>
      <SceneBackground scene={scene} />
      <CharacterDisplay character={character} characterExtra={characterExtra} />
    </div>
  );
}

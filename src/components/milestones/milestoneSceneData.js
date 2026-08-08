import parrot from "../../assets/illustrations/animals/parrot.png";
import deer1 from "../../assets/illustrations/animals/deer-1.png";
import monkey from "../../assets/illustrations/animals/moneky.png";
import hedgehog from "../../assets/illustrations/animals/hedgehog.png";
import turtle from "../../assets/illustrations/animals/turtle.png";
import butterfly from "../../assets/illustrations/animals/butterfly.png";
import lion from "../../assets/illustrations/animals/lion.png";
import squirrel from "../../assets/illustrations/animals/squirrel.png";
import deer2 from "../../assets/illustrations/animals/deer-2.png";
import owl from "../../assets/illustrations/animals/owl.png";
import bluebird from "../../assets/illustrations/animals/bluebird.png";
import elephant from "../../assets/illustrations/animals/elephant.png";
import giraffe from "../../assets/illustrations/animals/giraffe.png";

export const DESIGN_WIDTH = 1440;
export const DESIGN_HEIGHT = 900;

/*
 * Static illustration layers.
 *
 * Every position is expressed in the same 1440 × 900 design space.
 * Keep these values independent so each animal can later be replaced
 * with an animation component/video without changing the scene itself.
 */
export const ANIMALS = [
  {
    id: "parrot",
    src: parrot,
    left: 82,
    top: 120,
    width: 145,
    zIndex: 18,
    rotate: -4,
  },
  {
    id: "bluebird",
    src: bluebird,
    left: 470,
    top: 82,
    width: 92,
    zIndex: 20,
    rotate: -8,
  },
  {
    id: "butterfly",
    src: butterfly,
    left: 1065,
    top: 104,
    width: 108,
    zIndex: 19,
    rotate: 8,
  },
  {
    id: "owl",
    src: owl,
    left: 1195,
    top: 172,
    width: 118,
    zIndex: 19,
    rotate: 4,
  },
  {
    id: "monkey",
    src: monkey,
    left: 174,
    top: 410,
    width: 165,
    zIndex: 22,
    rotate: -5,
  },
  {
    id: "deer-1",
    src: deer1,
    left: 1115,
    top: 286,
    width: 148,
    zIndex: 21,
    rotate: 2,
  },
  {
    id: "giraffe",
    src: giraffe,
    left: 1280,
    top: 390,
    width: 155,
    zIndex: 20,
    rotate: 1,
  },
  {
    id: "lion",
    src: lion,
    left: 690,
    top: 590,
    width: 160,
    zIndex: 24,
    rotate: -2,
  },
  {
    id: "elephant",
    src: elephant,
    left: 1030,
    top: 590,
    width: 175,
    zIndex: 23,
    rotate: 2,
  },
  {
    id: "squirrel",
    src: squirrel,
    left: 370,
    top: 635,
    width: 118,
    zIndex: 24,
    rotate: -4,
  },
  {
    id: "hedgehog",
    src: hedgehog,
    left: 130,
    top: 695,
    width: 125,
    zIndex: 25,
    rotate: 2,
  },
  {
    id: "turtle",
    src: turtle,
    left: 510,
    top: 730,
    width: 125,
    zIndex: 25,
    rotate: -2,
  },
  {
    id: "deer-2",
    src: deer2,
    left: 1210,
    top: 655,
    width: 145,
    zIndex: 23,
    rotate: 3,
  },
];

/*
 * Milestone anchor points follow the visible path in the background.
 * These are presentation coordinates only; milestone content continues
 * to come from Supabase/Admin data.
 */
export const SIGNPOST_ANCHORS = [
  { left: 205, top: 684, rotation: -2 },
  { left: 415, top: 628, rotation: 2 },
  { left: 625, top: 548, rotation: -1 },
  { left: 830, top: 476, rotation: 2 },
  { left: 1035, top: 390, rotation: -2 },
  { left: 1210, top: 302, rotation: 1 },
];

export function getSignpostAnchor(index) {
  if (index < SIGNPOST_ANCHORS.length) {
    return SIGNPOST_ANCHORS[index];
  }

  const extraIndex = index - SIGNPOST_ANCHORS.length + 1;

  return {
    left: Math.max(1210 - extraIndex * 78, 930),
    top: Math.max(302 - extraIndex * 42, 215),
    rotation: extraIndex % 2 === 0 ? -2 : 2,
  };
}

import { setProjectAnnotations } from "@storybook/preact-vite";
import * as previewAnnotations from "./preview";

const _annotations = setProjectAnnotations([previewAnnotations]);

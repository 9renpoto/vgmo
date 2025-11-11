import { setProjectAnnotations } from '@storybook/preact-vite';
import * as previewAnnotations from './preview';

const annotations = setProjectAnnotations([previewAnnotations]);

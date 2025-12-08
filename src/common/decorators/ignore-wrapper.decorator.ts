import { SetMetadata } from '@nestjs/common';

export const IGNORE_WRAPPER_KEY = 'ignore_wrapper';
export const IgnoreWrapper = () => SetMetadata(IGNORE_WRAPPER_KEY, true);

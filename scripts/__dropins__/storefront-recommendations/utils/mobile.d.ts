/**
 * ADOBE CONFIDENTIAL
 * __________________
 * Copyright 2023 Adobe
 * All Rights Reserved.
 * __________________
 * NOTICE: All information contained herein is, and remains
 * the property of Adobe and its suppliers, if any. The intellectual
 * and technical concepts contained herein are proprietary to Adobe
 * and its suppliers and are protected by all applicable intellectual
 * property laws, including trade secret and copyright laws.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe.
 */
declare const isMobile: boolean;
declare const handleMobileDisplay: (target: HTMLLabelElement) => void;
/**
 * Commerce uses the class "active" to show/hide the search bar when on mobile.
 * That class changes the style of .label to { position: static },
 * same goal could also be achieved by manually adjusting that style. But we
 * are trying to find the less intrusive approach and leverage OOTB behavior.
 */
declare const toggleActiveClass: (target: HTMLLabelElement) => void;
export { isMobile, handleMobileDisplay, toggleActiveClass };
//# sourceMappingURL=mobile.d.ts.map
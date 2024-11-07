'use client';

import { useState, useEffect } from 'react';
import MobileTopdownParts from './mobile-topdown-parts';

export default function TopDown({ onData }) {
  return (
    <>
      <svg
        viewBox="0 0 196.16191 133.63594"
        version="1.1"
        id="svg1"
        xmlns="http://www.w3.org/2000/svg"
        className="w-72 h-60"
      >
        <defs id="defs1" />
        <g id="layer2" transform="translate(-9.3866979,-163.67377)">
          <MobileTopdownParts onData={onData} />
        </g>
      </svg>
    </>
  );
}

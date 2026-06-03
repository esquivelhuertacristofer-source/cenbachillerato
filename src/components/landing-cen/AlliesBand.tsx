'use client';

import React from 'react';

const SUBSISTEMAS = [
  'DGB', 'DGETI', 'DGETAyCM', 'CONALEP', 'COBACH', 'CECYT', 'CCH', 'ENP',
  'Bachilleratos con RVOE', 'Bachilleratos universitarios estatales',
  'Primarias y secundarias', 'Educación básica',
];

export function AlliesBand() {
  return (
    <>
      <div className="allies ab-band-light" id="instituciones">
        <div className="allies-eyebrow">Subsistemas educativos compatibles</div>
        <div className="marquee">
          <div className="marquee-track">
            {[...SUBSISTEMAS, ...SUBSISTEMAS].map((s, i) => (
              <React.Fragment key={i}>
                <span className="ally-name">{s}</span>
                <span className="ally-dot" />
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
      {/* Wave de transición ally → accordion */}
      <svg className="ab-wave-bottom" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 48" preserveAspectRatio="none" aria-hidden="true">
        <path fill="#F8FAFC" d="M0,24 C360,48 1080,0 1440,24 L1440,48 L0,48 Z"/>
      </svg>
    </>
  );
}

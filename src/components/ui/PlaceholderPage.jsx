import React from 'react';
import { Construction } from 'lucide-react';

const PlaceholderPage = ({ title }) => (
    <div className="flex flex-col items-center justify-center h-[50vh] text-neutral-400">
        <Construction className="h-16 w-16 mb-4 text-neutral-300" />
        <h3 className="text-xl font-semibold text-neutral-600">{title}</h3>
        <p>This module is under development for the demo.</p>
    </div>
);

export default PlaceholderPage;

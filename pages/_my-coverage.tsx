import '../styles/globals.css'
import React from 'react';
import {DappkitProviderCtx, defaulDappkitProvider} from '../context';
import { Icon, HorizontalNav } from '@taikai/rocket-kit';

function Coverage() {
 
  return (
    <DappkitProviderCtx.Provider value={defaulDappkitProvider}>
        <h1>Test coverage page</h1>
    </DappkitProviderCtx.Provider>
  );
}

export default Coverage
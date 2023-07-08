import React from 'react';
import { HotkeysProvider } from 'react-hotkeys-hook';
import { MemoryRouter } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import { RecoilRoot } from 'recoil';

import { INITIAL_HOTKEYS_SCOPES } from '@/hotkeys/constants';
import { RecoilScope } from '@/recoil-scope/components/RecoilScope';
import { HooksEntityTable } from '@/ui/components/table/HooksEntityTable';
import { DefaultLayout } from '@/ui/layout/DefaultLayout';
import { TableContext } from '@/ui/tables/states/TableContext';
import { companiesFilters } from '~/pages/companies/companies-filters';
import { ClientConfigProvider } from '~/providers/client-config/ClientConfigProvider';
import { UserProvider } from '~/providers/user/UserProvider';

import { mockedCompaniesData } from './mock-data/companies';
import { ComponentStorybookLayout } from './ComponentStorybookLayout';
import { FullHeightStorybookLayout } from './FullHeightStorybookLayout';
import { mockedClient } from './mockedClient';

export function getRenderWrapperForPage(
  children: React.ReactElement,
  currentPath: string,
) {
  return function render() {
    return (
      <RecoilRoot>
        <ApolloProvider client={mockedClient}>
          <UserProvider>
            <ClientConfigProvider>
              <HotkeysProvider initiallyActiveScopes={INITIAL_HOTKEYS_SCOPES}>
                <MemoryRouter initialEntries={[currentPath]}>
                  <FullHeightStorybookLayout>
                    <DefaultLayout>{children}</DefaultLayout>
                  </FullHeightStorybookLayout>
                </MemoryRouter>
              </HotkeysProvider>
            </ClientConfigProvider>
          </UserProvider>
        </ApolloProvider>
      </RecoilRoot>
    );
  };
}

export function getRenderWrapperForComponent(children: React.ReactElement) {
  return function render() {
    return (
      <RecoilRoot>
        <ApolloProvider client={mockedClient}>
          <ComponentStorybookLayout>{children}</ComponentStorybookLayout>
        </ApolloProvider>
      </RecoilRoot>
    );
  };
}

export function getRenderWrapperForEntityTableComponent(
  children: React.ReactElement,
) {
  return function Render() {
    return (
      <RecoilRoot>
        <ApolloProvider client={mockedClient}>
          <RecoilScope SpecificContext={TableContext}>
            <HooksEntityTable
              availableTableFilters={companiesFilters}
              numberOfColumns={5}
              numberOfRows={mockedCompaniesData.length}
            />
            <ComponentStorybookLayout>{children}</ComponentStorybookLayout>
          </RecoilScope>
        </ApolloProvider>
      </RecoilRoot>
    );
  };
}

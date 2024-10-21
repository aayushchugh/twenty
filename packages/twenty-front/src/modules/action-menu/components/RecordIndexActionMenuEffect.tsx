import { useActionMenu } from '@/action-menu/hooks/useActionMenu';
import { ActionMenuComponentInstanceContext } from '@/action-menu/states/contexts/ActionMenuComponentInstanceContext';
import { contextStoreNumberOfSelectedRecordsState } from '@/context-store/states/contextStoreNumberOfSelectedRecordsState';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { extractComponentState } from '@/ui/utilities/state/component-state/utils/extractComponentState';
import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';

export const RecordIndexActionMenuEffect = () => {
  const contextStoreNumberOfSelectedRecords = useRecoilValue(
    contextStoreNumberOfSelectedRecordsState,
  );

  const actionMenuId = useAvailableComponentInstanceIdOrThrow(
    ActionMenuComponentInstanceContext,
  );

  const { openActionBar, closeActionBar } = useActionMenu(actionMenuId);

  const isDropdownOpen = useRecoilValue(
    extractComponentState(
      isDropdownOpenComponentState,
      `action-menu-dropdown-${actionMenuId}`,
    ),
  );

  useEffect(() => {
    if (contextStoreNumberOfSelectedRecords > 0 && !isDropdownOpen) {
      // We only handle opening the ActionMenuBar here, not the Dropdown.
      // The Dropdown is already managed by sync handlers for events like
      // right-click to open and click outside to close.
      openActionBar();
    }
    if (contextStoreNumberOfSelectedRecords === 0 && isDropdownOpen) {
      closeActionBar();
    }
  }, [
    contextStoreNumberOfSelectedRecords,
    openActionBar,
    closeActionBar,
    isDropdownOpen,
  ]);

  return null;
};
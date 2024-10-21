import { ReactNode, useEffect, useState } from 'react';
import { useSetRecoilState } from 'recoil';

import { contextStoreCurrentObjectMetadataIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataIdState';
import {
  ContextStoreTargetedRecordsRule,
  contextStoreTargetedRecordsRuleState,
} from '@/context-store/states/contextStoreTargetedRecordsRuleState';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';

export const JestContextStoreSetter = ({
  contextStoreTargetedRecordsRule = {
    mode: 'selection',
    selectedRecordIds: [],
  },
  contextStoreCurrentObjectMetadataNameSingular = '',
  children,
}: {
  contextStoreTargetedRecordsRule?: ContextStoreTargetedRecordsRule;
  contextStoreCurrentObjectMetadataNameSingular?: string;
  children: ReactNode;
}) => {
  const setContextStoreTargetedRecordsRule = useSetRecoilState(
    contextStoreTargetedRecordsRuleState,
  );

  const setContextStoreCurrentObjectMetadataId = useSetRecoilComponentStateV2(
    contextStoreCurrentObjectMetadataIdComponentState,
  );

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: contextStoreCurrentObjectMetadataNameSingular,
  });

  const contextStoreCurrentObjectMetadataId = objectMetadataItem.id;

  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => {
    setContextStoreTargetedRecordsRule(contextStoreTargetedRecordsRule);
    setContextStoreCurrentObjectMetadataId(contextStoreCurrentObjectMetadataId);
    setIsLoaded(true);
  }, [
    setContextStoreTargetedRecordsRule,
    setContextStoreCurrentObjectMetadataId,
    contextStoreTargetedRecordsRule,
    contextStoreCurrentObjectMetadataId,
  ]);

  return isLoaded ? <>{children}</> : null;
};
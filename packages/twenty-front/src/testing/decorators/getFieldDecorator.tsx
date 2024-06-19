import { useEffect } from 'react';
import { Decorator } from '@storybook/react';
import { useRecoilCallback, useRecoilState } from 'recoil';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { formatFieldMetadataItemAsColumnDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsColumnDefinition';
import { isLabelIdentifierField } from '@/object-metadata/utils/isLabelIdentifierField';
import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import {
  RecordFieldValueSelectorContextProvider,
  useSetRecordValue,
} from '@/object-record/record-store/contexts/RecordFieldValueSelectorContext';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { DateFormat } from '@/workspace-member/constants/DateFormat';
import { TimeFormat } from '@/workspace-member/constants/TimeFormat';
import { detectTimeZone } from '@/workspace-member/utils/detectTimeZone';
import { getCompaniesMock } from '~/testing/mock-data/companies';
import { generatedMockObjectMetadataItems } from '~/testing/mock-data/objectMetadataItems';
import { getPeopleMock } from '~/testing/mock-data/people';
import { isDefined } from '~/utils/isDefined';

const RecordMockSetterEffect = ({
  companies,
  people,
}: {
  companies: ObjectRecord[];
  people: ObjectRecord[];
}) => {
  const setRecordValue = useSetRecordValue();

  const setRecordInBothStores = useRecoilCallback(
    ({ set }) =>
      (record: ObjectRecord) => {
        set(recordStoreFamilyState(record.id), record);
        setRecordValue(record.id, record);
      },
    [setRecordValue],
  );

  useEffect(() => {
    for (const company of companies) {
      setRecordInBothStores(company);
    }

    for (const person of people) {
      setRecordInBothStores(person);
    }
  }, [setRecordInBothStores, companies, people]);

  return null;
};

const WorkspaceMemberEffect = () => {
  const [, setCurrentWorkspaceMember] = useRecoilState(
    currentWorkspaceMemberState,
  );

  useEffect(() => {
    setCurrentWorkspaceMember({
      id: '1',
      name: {
        firstName: '',
        lastName: '',
      },
      locale: '',
      timeZone: detectTimeZone(),
      dateFormat: DateFormat.MONTH_FIRST,
      timeFormat: TimeFormat.MILITARY,
    });
  }, [setCurrentWorkspaceMember]);

  return <></>;
};

export const getFieldDecorator =
  (
    objectNameSingular: 'company' | 'person',
    fieldName: string,
    fieldValue?: any,
  ): Decorator =>
  (Story) => {
    const companiesMock = getCompaniesMock();

    const companies =
      objectNameSingular === 'company' && isDefined(fieldValue)
        ? [
            { ...companiesMock[0], [fieldName]: fieldValue },
            ...companiesMock.slice(1),
          ]
        : companiesMock;

    const peopleMock = getPeopleMock();

    const people =
      objectNameSingular === 'person' && isDefined(fieldValue)
        ? [
            { ...peopleMock[0], [fieldName]: fieldValue },
            ...peopleMock.slice(1),
          ]
        : peopleMock;

    const record = objectNameSingular === 'company' ? companies[0] : people[0];

    if (isDefined(fieldValue)) {
      (record as any)[fieldName] = fieldValue;
    }

    const objectMetadataItem = generatedMockObjectMetadataItems.find(
      (objectMetadataItem) =>
        objectMetadataItem.nameSingular === objectNameSingular,
    );

    const fieldMetadataItem = objectMetadataItem?.fields.find(
      (field) => field.name === fieldName,
    );

    if (!isDefined(objectMetadataItem)) {
      throw new Error(`Object ${objectNameSingular} not found`);
    }

    if (!isDefined(fieldMetadataItem)) {
      throw new Error(
        `Field ${fieldName} not found in object ${objectNameSingular}`,
      );
    }

    const isLabelIdentifier = isLabelIdentifierField({
      fieldMetadataItem,
      objectMetadataItem,
    });

    return (
      <RecordFieldValueSelectorContextProvider>
        <FieldContext.Provider
          value={{
            entityId: record.id,
            basePathToShowPage: '/object-record/',
            isLabelIdentifier,
            fieldDefinition: formatFieldMetadataItemAsColumnDefinition({
              field: fieldMetadataItem,
              position: record.position ?? 0,
              objectMetadataItem,
            }),
            hotkeyScope: 'hotkey-scope',
          }}
        >
          <RecordMockSetterEffect companies={companies} people={people} />
          <WorkspaceMemberEffect />
          <Story />
        </FieldContext.Provider>
      </RecordFieldValueSelectorContextProvider>
    );
  };
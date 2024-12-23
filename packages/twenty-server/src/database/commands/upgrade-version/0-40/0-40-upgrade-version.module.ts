import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UpdateWorkspaceStatusCommand } from 'src/database/commands/upgrade-version/0-40/0-40-update-workspace-status.command';
import { UpgradeTo0_40Command } from 'src/database/commands/upgrade-version/0-40/0-40-upgrade-version.command';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { WorkspaceSyncMetadataCommandsModule } from 'src/engine/workspace-manager/workspace-sync-metadata/commands/workspace-sync-metadata-commands.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Workspace], 'core'),
    TypeOrmModule.forFeature(
      [ObjectMetadataEntity, FieldMetadataEntity],
      'metadata',
    ),
    DataSourceModule,
    WorkspaceSyncMetadataCommandsModule,
  ],
  providers: [UpdateWorkspaceStatusCommand, UpgradeTo0_40Command],
})
export class UpgradeTo0_40CommandModule {}

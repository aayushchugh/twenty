import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceModule } from 'src/engine/core-modules/workspace/workspace.module';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { WorkspaceHealthModule } from 'src/engine/workspace-manager/workspace-health/workspace-health.module';
import { WorkspaceSyncMetadataModule } from 'src/engine/workspace-manager/workspace-sync-metadata/workspace-sync-metadata.module';

import { SyncWorkspaceMetadataCommand } from './sync-workspace-metadata.command';

import { SyncWorkspaceLoggerService } from './services/sync-workspace-logger.service';

@Module({
  imports: [
    WorkspaceHealthModule,
    WorkspaceModule,
    DataSourceModule,
    WorkspaceDataSourceModule,
    WorkspaceSyncMetadataModule,
    TypeOrmModule.forFeature([Workspace], 'core'),
  ],
  providers: [SyncWorkspaceMetadataCommand, SyncWorkspaceLoggerService],
  exports: [SyncWorkspaceMetadataCommand],
})
export class WorkspaceSyncMetadataCommandsModule {}

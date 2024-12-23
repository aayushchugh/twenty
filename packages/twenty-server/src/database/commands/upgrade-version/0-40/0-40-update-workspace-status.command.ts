import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { Repository } from 'typeorm';

import { ActiveWorkspacesCommandRunner } from 'src/database/commands/active-workspaces.command';
import { BaseCommandOptions } from 'src/database/commands/base.command';
import {
  Workspace,
  WorkspaceActivationStatus,
} from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';

@Command({
  name: 'upgrade-0.40:update-workspace-status',
  description: 'Update workspace status',
})
export class UpdateWorkspaceStatusCommand extends ActiveWorkspacesCommandRunner {
  constructor(
    @InjectRepository(Workspace, 'core')
    protected readonly workspaceRepository: Repository<Workspace>,
    protected readonly dataSourceService: DataSourceService,
  ) {
    super(workspaceRepository);
  }

  async executeActiveWorkspacesCommand(
    _passedParam: string[],
    _options: BaseCommandOptions,
    _workspaceIds: string[],
  ): Promise<void> {
    // Do nothing, this command is applied on all workspaces
  }

  async executeBaseCommand(
    _passedParam: string[],
    options: BaseCommandOptions,
  ): Promise<void> {
    const workspaces = await this.workspaceRepository.find({
      select: [
        'id',
        'activationStatus',
        'createdAt',
        'updatedAt',
        'deletedAt',
        'displayName',
      ],
    });

    for (const workspace of workspaces) {
      try {
        const dataSources =
          await this.dataSourceService.getDataSourcesMetadataFromWorkspaceId(
            workspace.id,
          );

        // Any workspace without datasource should be deleted so a returning user will create a new workspace
        if (dataSources.length === 0) {
          this.logger.warn(
            `Workspace ${workspace.id} (${workspace.activationStatus} / ${workspace.displayName} / ${workspace.createdAt} / ${workspace.updatedAt} / ${workspace.deletedAt}) has no data sources, deleting workspace`,
          );

          if (!options.dryRun) {
            await this.workspaceRepository.softDelete(workspace.id);
          }
          continue;
        }

        // This case should never happen, reporting error
        if (dataSources.length > 1) {
          this.logger.error(
            `Workspace ${workspace.id} (${workspace.activationStatus} / ${workspace.displayName} / ${workspace.createdAt} / ${workspace.updatedAt} / ${workspace.deletedAt}) has more than one data source, skipping`,
          );
          continue;
        }

        // Now dealing with our case: INACTIVE + 1 data source ==> SUSPENDED
        if (workspace.activationStatus === 'INACTIVE') {
          this.logger.warn(
            `Inactive Workspace ${workspace.id} (${workspace.activationStatus} / ${workspace.displayName} / ${workspace.createdAt} / ${workspace.updatedAt} / ${workspace.deletedAt}) has one data source, marking as SUSPENDED`,
          );

          if (!options.dryRun) {
            workspace.activationStatus = WorkspaceActivationStatus.SUSPENDED;
            await this.workspaceRepository.save(workspace);
          }
          continue;
        }

        // Logging untouched workspace, just for the record
        this.logger.log(
          `Workspace ${workspace.id} (${workspace.activationStatus} / ${workspace.displayName} / ${workspace.createdAt} / ${workspace.updatedAt} / ${workspace.deletedAt}) has one data source, skipping`,
        );
      } catch (error) {
        this.logger.error(
          `Error backfilling record position for workspace ${workspace.id}: ${error}`,
        );
      }
    }
  }
}

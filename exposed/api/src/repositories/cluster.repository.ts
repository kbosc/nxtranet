import {Getter, inject} from '@loopback/core';
import {BelongsToAccessor, DefaultCrudRepository, HasManyRepositoryFactory, repository, HasOneRepositoryFactory} from '@loopback/repository';
import {MongoDbDataSource} from '../datasources';
import {Cluster, ClusterRelations, Container, EnvVar, GitBranch, Project, ClusterProduction} from '../models';
import {ContainerRepository} from './container.repository';
import {EnvVarRepository} from './env-var.repository';
import {GitBranchRepository} from './git-branch.repository';
import {ProjectRepository} from './project.repository';
import {ClusterProductionRepository} from './cluster-production.repository';

export class ClusterRepository extends DefaultCrudRepository<
  Cluster,
  typeof Cluster.prototype.id,
  ClusterRelations
> {


  public readonly project: BelongsToAccessor<Project, typeof Cluster.prototype.id>;

  public readonly containers: HasManyRepositoryFactory<Container, typeof Cluster.prototype.id>;

  public readonly envVars: HasManyRepositoryFactory<EnvVar, typeof Cluster.prototype.id>;

  public readonly gitBranch: BelongsToAccessor<GitBranch, typeof Cluster.prototype.id>;

  public readonly production: HasOneRepositoryFactory<ClusterProduction, typeof Cluster.prototype.id>;

  constructor(
    @inject('datasources.mongoDB') dataSource: MongoDbDataSource,
    @repository.getter('ProjectRepository') protected projectRepositoryGetter: Getter<ProjectRepository>, @repository.getter('ContainerRepository') protected containerRepositoryGetter: Getter<ContainerRepository>, @repository.getter('EnvVarRepository') protected EnvVarRepositoryGetter: Getter<EnvVarRepository>, @repository.getter('GitBranchRepository') protected gitBranchRepositoryGetter: Getter<GitBranchRepository>, @repository.getter('ClusterProductionRepository') protected clusterProductionRepositoryGetter: Getter<ClusterProductionRepository>,
  ) {
    super(Cluster, dataSource);
    this.production = this.createHasOneRepositoryFactoryFor('production', clusterProductionRepositoryGetter);
    this.registerInclusionResolver('production', this.production.inclusionResolver);
    this.gitBranch = this.createBelongsToAccessorFor('gitBranch', gitBranchRepositoryGetter,);
    this.registerInclusionResolver('gitBranch', this.gitBranch.inclusionResolver);
    this.envVars = this.createHasManyRepositoryFactoryFor('envVars', EnvVarRepositoryGetter,);
    this.registerInclusionResolver('envVars', this.envVars.inclusionResolver);
    this.containers = this.createHasManyRepositoryFactoryFor('containers', containerRepositoryGetter,);
    this.registerInclusionResolver('containers', this.containers.inclusionResolver);
    this.project = this.createBelongsToAccessorFor('project', projectRepositoryGetter,);
    this.registerInclusionResolver('project', this.project.inclusionResolver);
  }
}

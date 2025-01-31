import {Getter, inject} from '@loopback/core';
import {BelongsToAccessor, DefaultCrudRepository, HasManyRepositoryFactory, HasOneRepositoryFactory, repository} from '@loopback/repository';
import {MongoDbDataSource} from '../datasources';
import {Cluster, Container, ContainerOutput, ContainerRelations, ContainerState, PipelineStatus} from '../models';
import {ClusterRepository} from './cluster.repository';
import {ContainerOutputRepository} from './container-output.repository';
import {ContainerStateRepository} from './container-state.repository';
import {PipelineStatusRepository} from './pipeline-status.repository';

export class ContainerRepository extends DefaultCrudRepository<
  Container,
  typeof Container.prototype.id,
  ContainerRelations
> {

  public readonly outputs: HasManyRepositoryFactory<ContainerOutput, typeof Container.prototype.id>;

  public readonly cluster: BelongsToAccessor<Cluster, typeof Container.prototype.id>;

  public readonly pipelineStatus: HasOneRepositoryFactory<PipelineStatus, typeof Container.prototype.id>;

  public readonly state: HasOneRepositoryFactory<ContainerState, typeof Container.prototype.id>;

  constructor(
    @inject('datasources.mongoDB') dataSource: MongoDbDataSource,
    @repository.getter('ClusterRepository') protected clusterRepositoryGetter: Getter<ClusterRepository>,
    @repository.getter('ContainerOutputRepository') protected containerOutputRepositoryGetter: Getter<ContainerOutputRepository>, @repository.getter('PipelineStatusRepository') protected PipelineStatusRepositoryGetter: Getter<PipelineStatusRepository>, @repository.getter('ContainerStateRepository') protected ContainerStateRepositoryGetter: Getter<ContainerStateRepository>,
  ) {
    super(Container, dataSource);
    this.state = this.createHasOneRepositoryFactoryFor('state', ContainerStateRepositoryGetter);
    this.registerInclusionResolver('state', this.state.inclusionResolver);
    this.pipelineStatus = this.createHasOneRepositoryFactoryFor('pipelineStatus', PipelineStatusRepositoryGetter);
    this.registerInclusionResolver('pipelineStatus', this.pipelineStatus.inclusionResolver);
    this.cluster = this.createBelongsToAccessorFor('cluster', clusterRepositoryGetter,);
    this.registerInclusionResolver('cluster', this.cluster.inclusionResolver);
    this.outputs = this.createHasManyRepositoryFactoryFor('outputs', containerOutputRepositoryGetter,);
    this.registerInclusionResolver('outputs', this.outputs.inclusionResolver);
  }
}

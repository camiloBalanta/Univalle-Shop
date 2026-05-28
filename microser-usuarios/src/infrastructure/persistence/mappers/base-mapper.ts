export abstract class Mapper<DomainEntity, DTOType> {
  abstract toPersistence(domain: DomainEntity): any;
  abstract toDomain(raw: any): DomainEntity;
  abstract toDTO(domain: DomainEntity): DTOType;
}

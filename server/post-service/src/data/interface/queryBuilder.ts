export class PostSearchBuilder {
  private matchCriteria: any = {};
  private fieldsToAdd: any = {};
  private sortOrder: any = {};
  private skip: number = 0;
  private pageSize: number = 10; // Default page size

  public search(query: string) {
    this.matchCriteria.$or = [
      { title: { $regex: query, $options: 'i' } },
      { about: { $regex: query, $options: 'i' } },
      { "ingredients.name": { $regex: query, $options: 'i' } },
      { "instructions.description": { $regex: query, $options: 'i' } },
    ];

    this.fieldsToAdd.titleMatch = {
      $cond: {
        if: { $regexMatch: { input: "$title", regex: query, options: 'i' } },
        then: 1,
        else: 0,
      },
    };

    this.sortOrder.titleMatch = -1;

    return this;
  }

  public paginate(pageSize: number = this.pageSize, page?: number) {
    if (!pageSize && !page) {
      return this;
    }
    this.pageSize = pageSize > 0 ? pageSize : this.pageSize;
    this.skip = page && page > 0 ? (page - 1) * this.pageSize : 0;

    return this;
  }

  public build(): any[] {
    const pipeline: any[] = [
      { $match: this.matchCriteria },
      { $addFields: this.fieldsToAdd },
      { $sort: this.sortOrder },
    ];

    // Add $skip and $limit based on pagination logic
    pipeline.push({ $skip: this.skip });
    pipeline.push({ $limit: this.pageSize }); // Use pageSize for limiting the number of documents

    return pipeline;
  }
}

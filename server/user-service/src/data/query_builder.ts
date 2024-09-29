export class UserSearchBuilder {
  private matchCriteria: any = {};
  private fieldsToAdd: any = {};
  private skip: number = 0;
  private pageSize: number = 10;

  public getMatchCriteria(): Record<string, any> {
    return this.matchCriteria;
  }

  public search(query: string) {
    if (!query) {
      this.matchCriteria = {};
      return this;
    }
    this.matchCriteria.$or = [
      { name: { $regex: query, $options: 'i' } },
      { email: { $regex: query, $options: 'i' } }
    ];

    this.fieldsToAdd.nameMatch = {
      $cond: {
        if: { $regexMatch: { input: "$name", regex: query, options: 'i' } },
        then: 1,
        else: 0,
      },
    };

    return this;
  }


  public filterByAccountCreationDate(minDate?: string, maxDate?: string) {
    if (minDate && maxDate) {
      this.matchCriteria.createdAt = {
        $gte: new Date(minDate),
        $lte: new Date(maxDate),
      };
    } else if (minDate) {
      this.matchCriteria.createdAt = { $gte: new Date(minDate) };
    } else if (maxDate) {
      this.matchCriteria.createdAt = { $lte: new Date(maxDate) };
    }

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
    const pipeline = [];

    if (Object.keys(this.matchCriteria).length > 0) {
      pipeline.push({ $match: this.matchCriteria });
    }

    pipeline.push({ $skip: this.skip });
    pipeline.push({ $limit: this.pageSize });

    return pipeline;
  }
}

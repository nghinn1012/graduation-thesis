export class PostSearchBuilder {
  private matchCriteria: any = {};
  private fieldsToAdd: any = {};
  private sortOrder: any = {};
  private skip: number = 0;
  private pageSize: number = 10;

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

  public filterByHashtags(hashtags: string[]) {
    if (hashtags && hashtags.length > 0) {
      this.matchCriteria.hashtags = { $in: hashtags };
    }
    return this;
  }

  public filterCookingTime(minTime?: string, maxTime?: string) {
    if (minTime || maxTime) {
      const minMinutes = minTime ? this.parseCookingTime(minTime) : 0;
      const maxMinutes = maxTime ? this.parseCookingTime(maxTime) : Number.MAX_VALUE;

      this.matchCriteria.cookingTime = {
        $gte: minMinutes,
        $lte: maxMinutes,
      };
    }

    return this;
  }

  public filterQuality(minQuality: number) {
    this.matchCriteria.quality = { $gte: minQuality };
    return this;
  }

  public filterPrice(minPrice: number, maxPrice: number) {
    this.matchCriteria.price = {
      $gte: minPrice,
      $lte: maxPrice,
    };
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

    pipeline.push({ $skip: this.skip });
    pipeline.push({ $limit: this.pageSize });

    return pipeline;
  }

  private parseCookingTime(cookingTime: string): number {
    const regex = /(?:(\d+)h)?\s*(?:(\d+)m)?/;
    const matches = cookingTime.match(regex);
    if (!matches) {
      return 0;
    }
    const hours = matches[1] ? parseInt(matches[1]) : 0;
    const minutes = matches[2] ? parseInt(matches[2]) : 0;

    return hours * 60 + minutes;
  }
}

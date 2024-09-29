export class PostSearchBuilder {
  private matchCriteria: any = {};
  private fieldsToAdd: any = {};
  private sortOrder: any = {};
  private skip: number = 0;
  private pageSize: number = 10;

  public getMatchCriteria(): Record<string, any> {
    return this.matchCriteria;
  }
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
    } else {
      delete this.matchCriteria.hashtags;
    }
    return this;
  }

  public filterCookingTime(minTime?: string, maxTime?: string) {
    console.log(minTime, maxTime);
    if (minTime && maxTime) {
      this.matchCriteria.timeToTake = {
        $gte: Number(minTime),
        $lte: Number(maxTime),
      };
    } else if (minTime) {
      this.matchCriteria.timeToTake = { $gte: Number(minTime) };
    }
    else if (maxTime) {
      this.matchCriteria.timeToTake = { $lte: Number(maxTime) };
    }

    return this;
  }

  public filterQuality(minQuality: number) {
    if (!this.matchCriteria.averageRating) {
      this.matchCriteria.averageRating = minQuality === 0 ? {} : { $gte: minQuality };
    } else {
      this.matchCriteria.averageRating = {
        ...this.matchCriteria.averageRating,
        $gte: minQuality,
      };
    }
    return this;
  }

  public filterByHavedMade = (haveMade: boolean) => {
    const condition = haveMade ? { $gt: 0 } : { };
    if (!this.matchCriteria.averageRating) {
      this.matchCriteria.averageRating = condition;
    } else {
      this.matchCriteria.averageRating = {
        ...this.matchCriteria.averageRating,
        ...condition,
      };
    }
    return this;
  }

  public filterPrice(minPrice: number, maxPrice: number) {
    this.matchCriteria.price = {
      $gte: minPrice,
      $lte: maxPrice,
    };
    return this;
  }

  public filterByDifficulty(difficulty: string[]) {
    if (difficulty && difficulty.length > 0) {
      this.matchCriteria.difficulty = { $in: difficulty };
    } else {
      delete this.matchCriteria.difficulty;
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
    const pipeline: any[] = [
      { $match: this.matchCriteria },
      { $addFields: this.fieldsToAdd },
      { $sort: this.sortOrder },
    ];

    pipeline.push({ $skip: this.skip });
    pipeline.push({ $limit: this.pageSize });

    return pipeline;
  }
}

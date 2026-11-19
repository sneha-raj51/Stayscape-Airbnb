class APIFeatures {
  /**
   * @param {mongoose.Query} query - Mongoose Query
   * @param {Object} queryString - Express req.query
   */
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  search() {
    if (this.queryString.keyword) {
      const keywordRegex = {
        $regex: this.queryString.keyword.trim(),
        $options: 'i'
      };

      this.query = this.query.find({
        $or: [
          { title: keywordRegex },
          { description: keywordRegex },
          { 'location.city': keywordRegex },
          { 'location.country': keywordRegex }
        ]
      });
    }

    return this;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = [
      'keyword',
      'page',
      'sort',
      'limit',
      'fields',
      'minPrice',
      'maxPrice',
      'guests',
      'city'
    ];
    excludedFields.forEach((field) => delete queryObj[field]);

    // Handle explicit filters
    const customFilters = {};

    // Filter by city
    if (this.queryString.city) {
      customFilters['location.city'] = {
        $regex: this.queryString.city.trim(),
        $options: 'i'
      };
    }

    // Filter by guests capacity
    if (this.queryString.guests) {
      const guests = parseInt(this.queryString.guests, 10);
      if (!isNaN(guests)) {
        customFilters.maxGuests = { $gte: guests };
      }
    }

    // Filter by price range
    if (this.queryString.minPrice || this.queryString.maxPrice) {
      customFilters.pricePerNight = {};
      if (this.queryString.minPrice) {
        const min = parseFloat(this.queryString.minPrice);
        if (!isNaN(min)) customFilters.pricePerNight.$gte = min;
      }
      if (this.queryString.maxPrice) {
        const max = parseFloat(this.queryString.maxPrice);
        if (!isNaN(max)) customFilters.pricePerNight.$lte = max;
      }
    }

    // Handle MongoDB operators (gte, gt, lte, lt, in)
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(
      /\b(gte|gt|lte|lt|in)\b/g,
      (match) => `$${match}`
    );

    const parsedQuery = JSON.parse(queryStr);
    const finalFilter = { ...parsedQuery, ...customFilters };

    this.query = this.query.find(finalFilter);
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }

    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }

    return this;
  }

  paginate() {
    const page = Math.max(parseInt(this.queryString.page, 10) || 1, 1);
    const limit = Math.max(
      Math.min(parseInt(this.queryString.limit, 10) || 12, 100),
      1
    );
    const skip = (page - 1) * limit;

    this.page = page;
    this.limit = limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

module.exports = APIFeatures;

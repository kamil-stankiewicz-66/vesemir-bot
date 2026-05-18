class LimitedQueue
{
    constructor(limit)
    {
        this.limit = limit;
        this.items = [];
    }

    setLimit(limit)
    {
        this.limit = limit;
    }

    add(item)
    {
        this.items.push(item);

        while (this.items.length > this.limit)
        {
            this.items.shift();
        }
    }

    getItems()
    {
        return [...this.items];
    }

    clear()
    {
        this.items = [];
    }

    size()
    {
        return this.items.length;
    }
}

module.exports = LimitedQueue;
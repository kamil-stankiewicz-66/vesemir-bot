const cron = require('node-cron');

class DelayedResponder
{
    constructor(config)
    {
        this.triggers = config.triggers;
        this.response = config.response;

        this.minResponseDelay = config.minResponseDelay;
        this.maxResponseDelay = config.maxResponseDelay;

        this.resetCron = config.resetCron;
        this.timezone = config.timezone || 'Europe/Warsaw';

        this.state = {
            isUsed: false,
            isScheduled: false
        };

        this.scheduleReset();
    }

    getState()
    {
        return structuredClone(this.state);
    }

    resetState()
    {
        this.state.isUsed = false;
        this.state.isScheduled = false;
    }

    scheduleReset()
    {
        cron.schedule(this.resetCron, () =>
        {
            this.resetState();
        },
        {
            timezone: this.timezone
        });
    }

    normalizeText(text)
    {
        return text
            .toLowerCase()
            .replace(/ł/g, 'l')
            .replace(/ą/g, 'a')
            .replace(/ć/g, 'c')
            .replace(/ę/g, 'e')
            .replace(/ń/g, 'n')
            .replace(/ó/g, 'o')
            .replace(/ś/g, 's')
            .replace(/ż/g, 'z')
            .replace(/ź/g, 'z')
            .replace(/[\u0300-\u036f]/g, '');
    }

    containsTrigger(text)
    {
        const normalized = this.normalizeText(text);

        return this.triggers.some(trigger =>
            normalized.includes(this.normalizeText(trigger))
        );
    }

    getRandomDelay()
    {
        const minutes = Math.random() * (this.maxResponseDelay - this.minResponseDelay) + this.minResponseDelay;
        return minutes * 60 * 1000;
    }

    async handle(message)
    {
        if (this.state.isUsed)
        {
            return false; //unlock other reply options
        }

        if (this.state.isScheduled)
        {
            return false; //unlock other reply options
        }

        if (!this.containsTrigger(message.content))
        {
            return false; //unlock other reply options
        }


        const delay = this.getRandomDelay();

        this.state.isScheduled = true;

        this.replyOnDelay(message, delay);


        return true; //lock other reply options
    }

    async replyOnDelay(message, delay)
    {
        await this.sleep(delay);
        await message.channel.send(this.response);

        this.state.isUsed = true;
        this.state.isScheduled = false;
    }

    sleep(ms)
    {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

module.exports = DelayedResponder;
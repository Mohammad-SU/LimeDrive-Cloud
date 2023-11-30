<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class RcloneDeleteJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $cloudPath;

    /**
     * Create a new job instance.
     */
    public function __construct($cloudPath)
    {
        $this->cloudPath = $cloudPath;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $rcloneCommand = env('RCLONE_EXE_PATH') . " delete b2remote:LimeDriveBucket/" . $this->cloudPath . " --b2-hard-delete --fast-list";
        exec($rcloneCommand);
    }
}

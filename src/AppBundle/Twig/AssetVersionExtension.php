<?php

namespace AppBundle\Twig;

class AssetVersionExtension extends \Twig_Extension
{
    /**
     * @var string
     */
    private $appDir;

    /**
     * @param string$appDir
     */
    public function __construct($appDir)
    {
        $this->appDir = $appDir;
    }

    /**
     * {@inheritdoc}
     */
    public function getName()
    {
        return 'asset_version';
    }

    /**
     * {@inheritdoc}
     */
    public function getFilters()
    {
        return array(
            new \Twig_SimpleFilter('asset_version', array($this, 'getAssetVersion')),
        );
    }

    /**
     * @param string $filename
     *
     * @return mixed
     * @throws \Exception
     */
    public function getAssetVersion($filename)
    {
        $manifestPath = $this->appDir.'/../web/assets/rev-manifest.json';
        if (!file_exists($manifestPath)) {
            throw new \Exception(sprintf('Cannot find manifest file: "%s"', $manifestPath));
        }
        $paths = json_decode(file_get_contents($manifestPath), true);
        if (!isset($paths[$filename])) {
            throw new \Exception(sprintf('There is no file "%s" in the version manifest!', $filename));
        }
        return $paths[$filename];
    }
}
